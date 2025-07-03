//src/pages/api/payment/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { sendSMS } from '../../../../utils/sms';
import { Nominee } from '../../../../types/nominee';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // Verify the webhook signature (implement this if needed)
    // const isValid = verifyPaystackWebhook(body, req.headers['x-paystack-signature']);
    // if (!isValid) {
    //   return res.status(400).json({ message: 'Invalid signature' });
    // }

    const { event, data } = body;

    if (event === 'charge.success') {
      const { reference, amount, metadata } = data;

      // Fetch nominee and contest details
      const { data: nomineeData, error: nomineeError } = await supabase
        .from('nominees')
        .select('name, contests(name)')
        .eq('id', metadata.nominee_id)
        .single();

      if (nomineeError) {
        console.error('Error fetching nominee details:', nomineeError);
        throw nomineeError;
      }

      const nominee = nomineeData as Nominee;

      console.log('Webhook received successful payment with data:', {
        reference,
        amount,
        metadata,
      });

      // Record transaction in database
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          contest_id: metadata.contest_id,
          nominee_id: metadata.nominee_id,
          voter: metadata.phone,
          channel: 'web',
          vote_count: metadata.vote_count,
          amount: amount / 100, // Convert from kobo to naira
          status: 'completed',
          reference: reference,
        })
        .select();

      if (transactionError) {
        console.error('Error recording transaction:', {
          error: transactionError,
          errorDetails: transactionError.details,
          errorHint: transactionError.hint,
          errorMessage: transactionError.message,
        });
        throw transactionError;
      }

      console.log('Transaction recorded successfully:', transactionData);

      // Record votes in database
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          contest_id: metadata.contest_id,
          category_id: metadata.category_id,
          nominee_id: metadata.nominee_id,
          phone_number: metadata.phone,
          email: metadata.email,
          payment_reference: reference,
        });

      if (voteError) {
        console.error('Error recording votes:', voteError);
        throw voteError;
      }

      // Update the vote count
      const { error: updateError } = await supabase
        .from('nominees')
        .update({
          votes: supabase.rpc('increment_votes', {
            nominee_id: metadata.nominee_id,
            increment: metadata.vote_count,
          }),
        })
        .eq('id', metadata.nominee_id);

      if (updateError) {
        console.error('Error updating vote count:', updateError);
        throw updateError;
      }

      // Send success SMS
      try {
        await sendSMS({
          to: metadata.phone,
          message: `Thank you for voting in ${nominee.contests[0].name}! Your payment of ₵${amount / 100} for ${metadata.vote_count} votes for ${nominee.name} has been processed successfully. Reference: ${reference}`
        });
      } catch (smsError) {
        console.error('Error sending success SMS:', smsError);
        // Don't throw the error as SMS failure shouldn't affect the payment process
      }
    } else if (event === 'charge.failed') {
      // Fetch nominee and contest details for failed payment message
      const { data: nomineeData, error: nomineeError } = await supabase
        .from('nominees')
        .select('name, contests(name)')
        .eq('id', data.metadata.nominee_id)
        .single();

      if (!nomineeError) {
        const nominee = nomineeData as Nominee;
        // Send failed payment SMS
        try {
          await sendSMS({
            to: data.metadata.phone,
            message: `Your payment of ₵${data.amount / 100} for ${data.metadata.vote_count} votes for ${nominee.name} in ${nominee.contests[0].name} has failed. Please try again or contact support.`
          });
        } catch (smsError) {
          console.error('Error sending failure SMS:', smsError);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
} 