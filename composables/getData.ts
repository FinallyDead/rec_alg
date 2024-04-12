export default class GetData {
  async loadData(url: string): Promise<Array<object>> {
    const response = await fetch(url)
    const data = await response.json()
    return data
  }
}