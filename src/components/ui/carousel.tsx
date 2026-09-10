import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { cn } from "@/lib/utils"

const CarouselContext = React.createContext<CarouselContextType | null>(null)

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
  className?: string
}

type CarouselContextType = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: CarouselApi | undefined
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

function Carousel({
  opts,
  plugins,
  orientation = "horizontal",
  setApi,
  className,
  children,
}: React.PropsWithChildren<CarouselProps>) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "vertical" ? "y" : "x",
    },
    plugins
  )

  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  React.useEffect(() => {
    if (!api) return

    setApi?.(api)

    const update = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    update()
    api.on("select", update)
    api.on("reInit", update)

    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api, setApi])

  const value = React.useMemo<CarouselContextType>(
    () => ({
      carouselRef: carouselRef,
      api,
      scrollPrev: () => api?.scrollPrev(),
      scrollNext: () => api?.scrollNext(),
      canScrollPrev,
      canScrollNext,
    }),
    [api, canScrollNext, canScrollPrev, carouselRef]
  )

  return (
    <CarouselContext.Provider value={value}>
      <div className={cn("relative", className)}>
        <div ref={carouselRef} className="overflow-hidden">
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex", className)}>{children}</div>
}

function CarouselItem({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 shrink-0 grow-0", className)}>{children}</div>
}

export { Carousel, CarouselContent, CarouselItem }
