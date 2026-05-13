import type { ILastGuessesProps } from "./@types"

export function LastGuesses({ guesses }: ILastGuessesProps) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[14px] font-bold">last guesses</p>
      <ul className="space-y-1 font-mono text-sm font-bold">
        {guesses.length === 0 ? (
          <li className="text-muted-foreground">—</li>
        ) : (
          guesses.map((g, i) => (
            <li key={`${g.playerName}-${g.letter}-${i}`}>
              {g.playerName.toLowerCase()} → {g.letter} ·{" "}
              {g.points === "miss" ? "miss" : `+${g.points}`}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
