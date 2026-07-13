import HeroSliderComponent from '@/blocks/HeroSlider/Component'
import BoardGridComponent from '@/blocks/BoardGrid/Component'
import LatestPostsComponent from '@/blocks/LatestPosts/Component'
import TrendingPostsComponent from '@/blocks/TrendingPosts/Component'
import SingleBoardComponent from '@/blocks/SingleBoard/Component'
import AdvertisementBlockComponent from '@/blocks/AdvertisementBlock/Component'
import RichTextBlockComponent from '@/blocks/RichTextBlock/Component'
import BannerBlockComponent from '@/blocks/BannerBlock/Component'
import PopularPostsComponent from '@/blocks/PopularPosts/component'
import RecentCommentsComponent from '@/blocks/RecentComments/Component'

type Block = {
  blockType: string
  [key: string]: any
}

type Props = {
  blocks: Block[]
}

export default function RenderBlocks({ blocks }: Props) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, idx) => {
        switch (block.blockType) {
          case 'heroSlider':
            return <HeroSliderComponent key={idx} {...(block as any)} />

          case 'boardGrid':
            return <BoardGridComponent key={idx} {...(block as any)} />

          case 'latestPosts':
            return <LatestPostsComponent key={idx} {...(block as any)} />

          case 'trendingPosts':
            return <TrendingPostsComponent key={idx} {...(block as any)} />

          case 'popularPosts':
            return <PopularPostsComponent key={idx} {...(block as any)} />

          case 'singleBoard':
            return <SingleBoardComponent key={idx} {...(block as any)} />

          case 'advertisementBlock':
            return <AdvertisementBlockComponent key={idx} {...(block as any)} />

          case 'richTextBlock':
            return <RichTextBlockComponent key={idx} {...(block as any)} />

          case 'bannerBlock':
            return <BannerBlockComponent key={idx} {...(block as any)} />

          case 'recentComments':
            return <RecentCommentsComponent key={idx} {...(block as any)} />

          default:
            return null
        }
      })}
    </>
  )
}
