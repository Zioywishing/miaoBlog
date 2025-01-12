<template>
  <div class="main">
    <div class="title">
      <span>导航</span>
    </div>
    <div class="content-warp">
      <div v-for="(item) in PageContent" :key="item.subTitle" class="content">
        <div class="sub-title">
          <span>{{ item.subTitle }}</span>
        </div>
        <div v-for="(cItem) in item.content" :key="cItem.name" class="content-item">
          <div class="content-item-name">{{ cItem.name }}</div>
          <div class="content-item-description">{{ cItem.description }}</div>
          <div class="content-item-link-warp">
            <div>link:</div>
            <a v-for="link in cItem.links" :href="link.url" target="_blank">{{ link.name }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

const PageContent = [
  {
    subTitle: '个人项目',
    content: [
      {
        name: 'miaoDirectory',
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
        name: 'miaoShare',
        description: '多了个加密环节的文件分享平台',
        links: [
          {
            name: "gitea",
            url: "https://nj.miaospring.top:3001/539943419/miaoShare"
          }
        ]
      }
    ]
  }
]

</script>

<style lang="scss" scoped>
.main {
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;

  .content-warp {
    box-sizing: border-box;
    width: 100%;
    padding: 0 15px;

    .content {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 250px));
      gap: 20px;
      /* 可选，设置子元素之间的间距 */

      .sub-title {
        font-size: 20px;
        margin-bottom: 10px;
        letter-spacing: 2px;
        grid-row: 1 / span 1;
        grid-column: 1 / -1;
      }

      .content-item {
        border: 1px solid #000;
        display: flex;
        flex-direction: column;
        align-items: baseline;
        // margin-bottom: 10px;
        padding: 5px 10px 10px 10px;
        border-radius: 10px;

        .content-item-name {
          font-size: 20px;
          padding-bottom: 5px;
        }

        .content-item-description {
          font-size: 14px;
          font-weight: 300;
        }

        .content-item-link-warp {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
          user-select: none;

          &>div {
            font-size: 14px;
            font-weight: 300;
            margin-right: 10px;
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
    margin-bottom: 20px;

    &>span {
      font-size: 30px;
      letter-spacing: 10px;
    }
  }
}
</style>