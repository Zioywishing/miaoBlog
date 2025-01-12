// @ts-ignore
import testData from "~/public/testData/test.md"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = testData
  return { data, title: `测试标题::{${body.id}}` }
})