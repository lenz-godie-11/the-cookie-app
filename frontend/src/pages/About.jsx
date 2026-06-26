import React from "react";

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-indigo-600 text-white text-center py-12 px-6 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold sm:text-4xl mb-2 tracking-tight">
            About Cookie App
          </h1>
          <p className="text-indigo-100 text-lg max-w-xl mx-auto leading-relaxed">
            A robust inventory management system designed to track food items
            and optimize daily expenses seamlessly.
          </p>
        </div>

        <div className="p-8 sm:p-12 space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-100 text-left">
              Our Purpose
            </h2>
            <p className="text-gray-600 leading-relaxed text-left text-base">
              Cookie App was built to simplify the way you manage food stock and
              control your daily expenditures. With this system, you can easily
              prevent food waste, keep an eye on items that are running low, and
              plan your budget effectively without any hassle.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-100 text-left">
              The Developer
            </h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100/50">
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-inner">
                  LD
                </div>
              </div>

              <div className="text-center sm:text-left space-y-2 flex-1">
                <h3 className="text-xl font-bold text-gray-900 leading-none">
                  Lenz David
                </h3>
                <p className="text-sm text-indigo-600 font-medium tracking-wide">
                  Lead Full-Stack Developer
                </p>
                <p className="text-gray-600 text-sm leading-relaxed pt-1">
                  As the creator of Cookie App, my goal was to build a clean,
                  modern, and intuitive digital solution that addresses
                  real-world resource management challenges in daily life.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 border-gray-100 text-left">
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-5 bg-green-50/60 border border-green-100 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
                <span className="block text-green-700 font-semibold text-base">
                  Track Inventory
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Know exactly what food items are in stock at any given time.
                </span>
              </div>

              <div className="p-5 bg-orange-50/60 border border-orange-100 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
                <span className="block text-orange-700 font-semibold text-base">
                  Expense Control
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Minimize unnecessary spending with data-driven tracking.
                </span>
              </div>

              <div className="p-5 bg-blue-50/60 border border-blue-100 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
                <span className="block text-blue-700 font-semibold text-base">
                  Smart Notifications
                </span>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Get alerted instantly when items are expiring or running low.
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
