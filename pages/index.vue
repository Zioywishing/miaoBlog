<template>
  <div class="main">
    <div class="title">
      <span>导航</span>
    </div>
    <div class="content-wrap">
      <div v-for="(item) in PageContent" :key="item.subTitle" class="content">
        <div class="sub-title">
          <miao-divider-left>
            <div class="sub-title-wrapper">
              <div class="sub-title-text">{{ item.subTitle }}</div>
              <div :class="['sub-title-chevron', item.show ? '' : 'sub-title-chevron-hide']"
                @click="switchItemShow(item)">
                <ChevronDown />
              </div>
            </div>
          </miao-divider-left>
        </div>
        <miao-collapse :show="item.show">
          <div :class="['content-items-wrap']">
            <div v-for="(cItem) in item.content" :key="cItem.name" class="content-item">
              <div class="content-item-name">{{ cItem.name }}</div>
              <div class="content-item-description">{{ cItem.description }}</div>
              <div class="content-item-link-wrap">
                <div class="content-item-link-wrap-icon"> <link-icon /></div>
                <a v-for="link in (cItem.links ?? [])" :href="link.url" target="_blank">{{ link.name }}</a>
                <NuxtLink v-for="link in (cItem.nuxtLinks ?? [])" :to="link.to">{{ link.name }}</NuxtLink>
              </div>
            </div>
          </div>
        </miao-collapse>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import miaoDividerLeft from '~/components/miaoDivider-left.vue';
// @ts-ignore
import ChevronDown from "~/components/icons/chevronDown.vue";
import linkIcon from '~/components/icons/link.vue';
import miaoCollapse from '~/components/miaoCollapse.vue';

type PageContent = {
  subTitle: string,
  show: boolean,
  content: ContentItem[]
}
type ContentItem = {
  name: string,
  description: string,
  links?: {
    name: string,
    url: string
  }[],
  nuxtLinks?: {
    name: string,
    to: string
  }[]
}

const PageContent = reactive<PageContent[]>([
  {
    subTitle: '个人项目',
    show: true,
    content: [
      {
        name: 'MiaoDirectory',
        description: '有个插件功能的单文件文件托管服务',
        links: [
          {
            name: 'github',
            url: "https://github.com/Zioywishing/miao-directory",
          },
          {
            name: 'gitea',
            url: 'https://nj.miaospring.top:3001/539943419/miaoDirectory',
          }
        ]
      },
      {
        name: 'MiaoShare',
        description: '多了个加密环节的文件分享平台',
        links: [
          {
            name: "gitea",
            url: "https://nj.miaospring.top:3001/539943419/miaoShare"
          }
        ]
      },
      {
        name: 'MiaoBlog',
        description: '施工中，不过最好不要抱有太大期待，毕竟还是以实现功能为目标去做的',
        links: [
          {
            name: "gitea",
            url: "https://nj.miaospring.top:3001/539943419/miaoBlog.git"
          },
          {
            name: "github",
            url: "https://github.com/Zioywishing/miaoBlog"
          }
        ]
      }
    ]
  }, {
    subTitle: '小工具',
    show: true,
    content: [
      {
        name: 'Genshin-Gacha',
        description: '通过模拟来计算抽卡成功率的小工具',
        nuxtLinks: [
          {
            name: 'demo',
            to: `/iframe/${encodeURIComponent('/iframe-source/genshin-gacha/index.html')}`
          }
        ]
      },
      {
        name: 'MiaoTracker',
        description: '仅仅是个接口而已，用来查询开发者的位置记录',
        nuxtLinks: [
          {
            name: 'demo',
            to: `/iframe/${encodeURIComponent('https://nj.miaospring.top:17582/api/getAllPositions')}`
          }
        ]
      },
      {
        name: '识趣阅读刷赞',
        description: '给我妹自嗨用的',
        nuxtLinks: [
          {
            name: 'link',
            to: `/tools/fucksq`
          }
        ]
      },
      {
        name: '喵喵图床',
        description: '其实就是一个很简陋的图床，上传，下载，没了',
        nuxtLinks: [
          {
            name: 'link',
            to: `/tools/imgBed`
          }
        ]
      },
      {
        name: 'QRGB',
        description: '把三个二维码叠在一起，真是创创又新新啊',
        nuxtLinks: [
          {
            name: 'link',
            to: `/tools/QRGB`
          }
        ]
      },
      {
        name: 'ES-Crypto',
        description: '结合浏览器fileSystem实现的加密小工具，再也不用担心内存爆掉了',
        nuxtLinks: [
          {
            name: 'demo',
            to: `/iframe/${encodeURIComponent('/iframe-source/es-crypto/index.html')}`
          }
        ]

      },
    ]
  }, {
    subTitle: '学习资料',
    show: true,
    content: [
      {
        name: 'VUE',
        description: 'vue3官方文档',
        links: [
          {
            name: 'vue3',
            url: 'https://cn.vuejs.org/'
          }
        ]
      },
      {
        name: 'Nuxt',
        description: 'Nuxt官方文档',
        links: [
          {
            name: 'Nuxt',
            url: 'https://nuxt.com/'
          }
        ]
      },
      {
        name: 'Element-plus',
        description: 'element-plus官方文档',
        links: [
          {
            name: 'element-plus',
            url: 'https://element-plus.org/zh-CN/guide/design.html'
          }
        ]
      }
    ]
  },
])

const switchItemShow = (item: PageContent) => {
  item.show = !item.show
}

// useHead({
//   title: '杪 Blog | 首页',
// })

</script>

<style lang="scss" scoped>
.main {
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
  background: #fff;

  .content-wrap {
    box-sizing: border-box;
    width: 100%;
    padding: 0 15px;

    .content {

      padding-bottom: 20px;

      .sub-title {
        display: flex;
        height: 80px;
        margin-bottom: 10px;
        letter-spacing: 2px;
        user-select: none;

        .sub-title-wrapper {
          height: 80px;
          display: flex;
          align-items: center;
        }

        .sub-title-text {
          font-size: 20px;
          // font-weight: 500;
          letter-spacing: 2px;
          margin-right: 10px;
          // width: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sub-title-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          transition: color .15s linear,
            transform 0.3s ease;
          cursor: pointer;
          color: #535353;

          // &:hover {
          //   color: #000000;
          // }

          &-hide {
            transform: rotate(180deg);
          }
        }
      }

      .content-items-wrap {
        max-height: 400vh;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        justify-content: center;
        // align-items: end;
        gap: 20px;
        // overflow: hidden;
        transition: max-height 0.25s ease, opacity 0.25s ease;
        opacity: 1;

        // margin: 0 -20px;
        &-hide {
          max-height: 0;
          // opacity: 0;
        }
      }

      .content-item {
        // border: 1px solid #000;
        display: flex;
        flex-direction: column;
        align-items: baseline;
        padding-bottom: 10px;
        border-radius: 10px;
        overflow: hidden;
        transition: scale 0.15s ease;
        user-select: none;

        background-color: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(19px);
        border: .5px solid rgba(255, 255, 255, 0.18);
        box-shadow: rgba(142, 142, 142, 0.19) 0px 6px 15px 0px;
        -webkit-box-shadow: rgba(142, 142, 142, 0.19) 0px 6px 15px 0px;

        &:hover {
          scale: 1.01;
        }

        .content-item-name {
          box-sizing: border-box;
          width: 100%;
          font-size: 20px;
          padding-bottom: 5px;
          background-color: #15aa87ce;
          color: #fff;
          padding: 3px 10px 5px;
          letter-spacing: 0px;
          margin-bottom: 10px;
          // font-family: PT Serif, Serif;
          // font-weight: 600;
        }

        .content-item-description {
          font-size: 14px;
          font-weight: 300;
          padding: 0 10px;
          min-height: 40px;
        }

        .content-item-link-wrap {
          flex: 1;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
          user-select: none;
          padding-right: 10px;

          &-icon {
            // font-size: 14px;
            // font-weight: 300;
            margin-right: 10px;
            height: 16px;
            aspect-ratio: 1;
            transform: translateY(0px) rotate(-45deg);
            opacity: .7;
          }

          &>a {
            &:not(:last-child) {
              margin-right: 10px;
            }

            color: #000;
            font-size: 14px;
            font-weight: 300;
            text-decoration: none;
            transition: color .15s linear;
            cursor: pointer;

            &:hover {
              color: #15aa87;
            }
          }
        }
      }
    }
  }

  .title {
    width: 100%;
    display: flex;
    justify-content: center;
    user-select: none;
    // margin-bottom: 10px;

    &>span {
      font-size: 30px;
      letter-spacing: 10px;
    }
  }
}

@media screen and (max-width: 999px) {
  .main .content-wrap .content .content-items-wrap {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>