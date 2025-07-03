"use client"
import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

interface PaymentFormProps {
  contest: {
    id: string;
    cost_per_vote: number;
  };
  nominee: {
    id: string;
    name: string;
  };
  category: {
    id: string;
  };
}

export default function PaymentForm({
  contest,
  nominee,
  category,
}: PaymentFormProps) {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    email: "",
    numberOfVotes: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotalCost = () => {
    const baseCost = formData.numberOfVotes * contest.cost_per_vote;
    let platformFeePercentage = 0.05;
    if (formData.numberOfVotes >= 100) {
      platformFeePercentage = 0.015;
    } else if (formData.numberOfVotes >= 50) {
      platformFeePercentage = 0.02;
    } else if (formData.numberOfVotes >= 20) {
      platformFeePercentage = 0.03;
    } else if (formData.numberOfVotes >= 10) {
      platformFeePercentage = 0.04;
    }
    const platformFee = baseCost * platformFeePercentage;
    return baseCost + platformFee;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email:
            formData.email ||
            `${nominee.name.split(" ")[0].toLowerCase()}@xtopolls.com`,
          amount: calculateTotalCost(),
          metadata: {
            contest_id: contest.id,
            category_id: category.id,
            nominee_id: nominee.id,
            number_of_votes: formData.numberOfVotes,
            phone_number: formData.phoneNumber,
          },
        }),
      });

      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message);
      }

      interface PaystackPop {
        setup: (config: {
          key: string;
          email: string;
          amount: number;
          ref: string;
          onClose: () => void;
          callback: (response: { status: string; reference: string }) => void;
        }) => { openIframe: () => void };
      }

      const handler = (window as unknown as { PaystackPop: PaystackPop }).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email:
          formData.email ||
          `${nominee.name.split(" ")[0].toLowerCase()}@xtopolls.co`,
        amount: calculateTotalCost() * 100,
        ref: data.data.reference,
        onClose: () => {
          setIsLoading(false);
          Swal.fire({
            title: "Payment Cancelled",
            text: "Your payment was cancelled. You can try again if you wish.",
            icon: "info",
            confirmButtonText: "OK",
          });
        },
        callback: async (response: { status: string; reference: string }) => {
          if (response.status === "success") {
            await Swal.fire({
              title: "Success!",
              text: `Your ${formData.numberOfVotes} votes for ${nominee.name} have been recorded successfully!`,
              icon: "success",
              confirmButtonText: "OK",
            });
            window.location.reload();
          }
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Payment error:", error);
      await Swal.fire({
        title: "Payment Failed",
        text: "Failed to process payment. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handlePayment} className="space-y-4">
        {/* Form fields and payment summary (same as in your original file) */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email (Optional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label
            htmlFor="numberOfVotes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Number of Votes
          </label>
          <input
            type="number"
            id="numberOfVotes"
            name="numberOfVotes"
            value={formData.numberOfVotes}
            onChange={handleInputChange}
            min="1"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Cost per vote:</span>
            <span className="font-medium">
              GH₵{contest.cost_per_vote.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Number of votes:</span>
            <span className="font-medium">{formData.numberOfVotes}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Platform fee:</span>
            <span className="font-medium">
              GH₵
              {(
                formData.numberOfVotes *
                contest.cost_per_vote *
                (formData.numberOfVotes >= 100
                  ? 0.015
                  : formData.numberOfVotes >= 50
                  ? 0.02
                  : formData.numberOfVotes >= 20
                  ? 0.03
                  : formData.numberOfVotes >= 10
                  ? 0.04
                  : 0.05)
              ).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold">Total cost:</span>
            <span className="font-semibold">
              GH₵{calculateTotalCost().toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors duration-200 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Processing..." : "Proceed to Payment"}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        By proceeding, you agree to our{" "}
        <Link href="/legal/terms" className="text-blue-600 hover:text-blue-800">
          terms and conditions
        </Link>
        . All payments are processed securely through Paystack.
      </p>
    </>
  );
}