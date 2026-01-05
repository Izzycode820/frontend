import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/shadcn-ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"

type DashboardCard = {
  title: string
  value: string
  trend: string
  trendDirection: string
}

type SectionCardsProps = {
  cards: (DashboardCard | null)[]
}

export function SectionCards({ cards }: SectionCardsProps) {
  // Filter out null cards and ensure we have data
  const validCards = cards.filter((card): card is DashboardCard => card !== null)

  if (validCards.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        <p className="text-muted-foreground text-center py-8">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {validCards.map((card, index) => {
        const isUp = card.trendDirection === 'up'
        const TrendIcon = isUp ? IconTrendingUp : IconTrendingDown

        return (
          <Card key={index} className="@container/card">
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon className="size-3" />
                  {card.trend}
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}
