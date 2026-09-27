const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]

function Journey() {
  return (
    <section
      aria-labelledby="journey-heading"
      className="flex flex-col gap-8 border border-dashed m-4 p-8"
    >
      <h2 id="journey-heading">Journey</h2>

      {/* Mobile: vertical list, left border is the axis.
          lg+: one column per year, cards alternate above/below a center axis. */}
      <div className="relative">
        <div aria-hidden="true" className="hidden lg:block absolute inset-x-0 top-1/2 border-t" />
        <ol className="flex flex-col gap-4 border-l pl-4 lg:grid lg:grid-cols-8 lg:gap-4 lg:border-l-0 lg:pl-0">
          {years.map((year, i) => (
            <li key={year} className="lg:grid lg:grid-rows-2 lg:gap-8">
              <article
                className={`flex flex-col gap-2 border p-4 ${
                  i % 2 === 0 ? 'lg:row-start-1 lg:self-end' : 'lg:row-start-2 lg:self-start'
                }`}
              >
                <h3>{year}</h3>
                <p>Milestone goes here</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default Journey
