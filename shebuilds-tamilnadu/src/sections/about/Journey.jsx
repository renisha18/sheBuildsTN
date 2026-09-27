function Journey() {
  return (
    <section className="border border-dashed m-4 p-8">
      <p>Journey</p>
      <div className="flex gap-4 mt-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex-1 border p-4">
            Card {n}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Journey
