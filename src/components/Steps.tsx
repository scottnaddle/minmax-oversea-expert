'use client'

interface StepsProps {
  current: number
  steps?: string[]
}

const defaultSteps = ['기본 정보', '경력 / 학력', '증빙 서류', '완료']

export default function Steps({ current, steps = defaultSteps }: StepsProps) {
  return (
    <div className="bg-white border-b border-gray-300 py-4 shrink-0">
      <div className="max-w-[560px] mx-auto flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < current
          const isCurrent = index === current
          
          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted
                      ? 'bg-green-600 border-2 border-green-600 text-white'
                      : isCurrent
                      ? 'bg-primary border-2 border-primary text-white'
                      : 'bg-gray-200 border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span
                  className={`text-[11px] whitespace-nowrap ${
                    isCurrent ? 'text-primary font-semibold' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-4 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}