"use client";
import { motion } from "framer-motion";
import { Container } from "./Container";

export const ExaFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100 border-t border-gray-800">
      <Container>
        <div className="pt-8 pb-8">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-16"></div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="border-t border-gray-800 my-6"
          />

          {/* Final Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-sm text-gray-500"
              aria-label={`Copyright ${currentYear} Sendexa, Inc.`}
            >
              &copy; {currentYear}{" "}
              <span className="font-medium text-[#f8971d] transition-colors duration-300 underline-offset-2">
                Xtopolls, LLC.
              </span>
              . All rights reserved.
            </motion.p>

            {/* Built with Love by Xtottel Ltd */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-sm text-gray-500 transition-all group"
            >
              <p className="transition-all duration-300">
                Built with <span className="text-red-500"> 💚</span> by{" "}
                <span className="font-medium text-[#f8971d] group-hover:text-yellow-500 transition-colors duration-300">
                  Xtottel Ltd
                </span>
              </p>
            </motion.div>
          </div>
        </div>
      </Container>
    </footer>
  );
};
