export const metadata = {
  title: 'Savings Goal Calculator | Money With Sense',
  description: 'Estimate how much to save each month to reach your target by a chosen date.',
}

function calculateMonthly(target: number, current: number, months: number) {
  if (months <= 0) return 0
  const remaining = Math.max(target - current, 0)
  return remaining / months
}

export default function SavingsGoalCalculator() {
  return (
    <div className="bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Calculator</p>
          <h1 className="text-3xl md:text-4xl font-bold">Savings Goal</h1>
          <p className="text-gray-600">
            Set a target amount, your current savings, and a timeline. Get a monthly savings estimate.
          </p>
        </div>

        <form
          className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50 p-5"
          onSubmit={(e) => e.preventDefault()}
          id="savings-form"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm text-gray-700">
              Target amount (USD)
              <input
                name="target"
                type="number"
                min="0"
                step="100"
                defaultValue="10000"
                className="mt-1 rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </label>
            <label className="flex flex-col text-sm text-gray-700">
              Current savings (USD)
              <input
                name="current"
                type="number"
                min="0"
                step="100"
                defaultValue="1000"
                className="mt-1 rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col text-sm text-gray-700">
              Months to goal
              <input
                name="months"
                type="number"
                min="1"
                step="1"
                defaultValue="12"
                className="mt-1 rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </label>
            <label className="flex flex-col text-sm text-gray-700">
              Optional monthly interest rate (%)
              <input
                name="interest"
                type="number"
                min="0"
                step="0.1"
                defaultValue="0"
                className="mt-1 rounded-lg border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <span className="text-xs text-gray-500 mt-1">Assumes simple monthly compounding if provided.</span>
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Note: This is a simplified estimate. Actual returns and timelines vary. For informational purposes only.
          </p>
        </form>

        <div className="rounded-2xl border border-gray-100 p-5 bg-white" id="savings-result">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Estimated monthly savings</h2>
          <p className="text-3xl font-bold text-emerald-700" id="savings-output">$750</p>
          <p className="text-sm text-gray-500 mt-2">
            Based on your inputs. Adjust the fields above to recalculate instantly.
          </p>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const form = document.getElementById('savings-form');
                const output = document.getElementById('savings-output');
                if (!form || !output) return;

                function recalc() {
                  const target = parseFloat(form.target.value) || 0;
                  const current = parseFloat(form.current.value) || 0;
                  const months = parseInt(form.months.value) || 1;
                  const interest = parseFloat(form.interest.value) || 0;

                  if (months <= 0 || target <= current) {
                    output.textContent = '$0';
                    return;
                  }

                  // Simple monthly interest approximation
                  const monthlyRate = interest > 0 ? (interest / 100) : 0;
                  let remaining = Math.max(target - current, 0);
                  let needed = 0;

                  if (monthlyRate === 0) {
                    needed = remaining / months;
                  } else {
                    // sum of series with contributions and growth
                    // approximate with PMT-like formula
                    const r = monthlyRate;
                    needed = remaining * r / (Math.pow(1 + r, months) - 1);
                  }

                  output.textContent = '$' + needed.toFixed(0).toString();
                }

                form.addEventListener('input', recalc);
                recalc();
              })();
            `,
          }}
        />
      </div>
    </div>
  )
}
