import { useState } from 'react'

const demoLists = [
  {
    title: 'To Do',
    cards: [
      { title: 'Create database models' },
      { title: 'Setup authentication' },
    ],
  },
  {
    title: 'In Progress',
    cards: [
      { title: 'Frontend UI with Tailwind' },
    ],
  },
  {
    title: 'Done',
    cards: [
      { title: 'Docker setup' },
      { title: 'Prisma migration' },
    ],
  },
]

export default function App() {
  const [lists] = useState(demoLists)

  return (
    <div className="min-h-screen bg-blue-100">
      <header className="flex items-center justify-between px-8 py-6 bg-white shadow">
        <h1 className="text-2xl font-bold text-blue-700">Trello Board</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">
          Log Out
        </button>
      </header>
      <main className="p-8 flex gap-6 overflow-x-auto">
        {lists.map((list, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow w-72 flex-shrink-0">
            <div className="px-4 py-3 border-b font-semibold text-blue-700">{list.title}</div>
            <div className="p-4 flex flex-col gap-3">
              {list.cards.map((card, cidx) => (
                <div key={cidx} className="bg-blue-50 border border-blue-200 rounded p-3 text-gray-800 shadow-sm">
                  {card.title}
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <button className="w-full bg-blue-100 text-blue-700 rounded py-2 mt-2 hover:bg-blue-200 transition font-medium">
                + Add Card
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}