export default class RecognizeGraphicData {
  
   public processData(data: Array<object> | object): string | object  {
    const graphicData = this.recursiveProcessing(data)  
    console.log(graphicData)
    return Object.keys(graphicData).length > 0 ? graphicData : 'There is no data for graphic visualization'
  }
  
  recursiveProcessing<T extends object | string | number>(data: Array<T> | object, depth: number = 0, nodeIndex?: number): object {
    let graphicData: object = {}
    const fieldAxisXLabels: string = `labelsX_${depth == 0 ? 'root' : depth}${Number.isInteger(nodeIndex) ? '_' : ''}${nodeIndex ?? ''}`
    const fieldAxisYLabels: string = `labelsY_${depth == 0 ? 'root' : depth}${Number.isInteger(nodeIndex) ? '_' : ''}${nodeIndex ?? ''}`

    if (Array.isArray(data)) {
      data.forEach((node: object | string | number,index: number) => {
        const graphicAxisXFieldData = fieldAxisXLabels in graphicData && Array.isArray(graphicData[fieldAxisXLabels as keyof typeof graphicData]) 
          ? [...graphicData[fieldAxisXLabels as keyof typeof graphicData]] 
          : []
        const graphicAxisYFieldData = fieldAxisYLabels in graphicData && Array.isArray(graphicData[fieldAxisYLabels as keyof typeof graphicData]) 
          ? [...graphicData[fieldAxisYLabels as keyof typeof graphicData]] 
          : []
        let depthCopy: number = depth
        if (typeof node === 'object') {
          const callResult = this.recursiveProcessing(node, ++depthCopy, index)
          const resultKeys = Object.keys(callResult)
          fieldAxisXLabels == 'labelsX_root' 
          ? graphicData = {...graphicData, ...callResult }
          : graphicData = {...graphicData, [fieldAxisXLabels]: [...graphicAxisXFieldData,...callResult[resultKeys[0] as keyof typeof callResult]], [fieldAxisYLabels]: [...graphicAxisYFieldData,...callResult[resultKeys[1] as keyof typeof graphicData]]}
        } 
        else 
          Number.isInteger(+node) 
            ? graphicData = {...graphicData, [fieldAxisYLabels]: [...graphicAxisYFieldData, node]}
            : graphicData = {...graphicData, [fieldAxisXLabels]: [...graphicAxisXFieldData, node]}
        console.log(graphicData)
      })
    } 
    else if (typeof data === 'object') {
      const dataKeys: Array<string> = Object.keys(data)
      const keysOfArraysAndObjects: Array<string> = dataKeys.filter((elem: string) => typeof data[elem as keyof typeof data] === 'object')
      if (dataKeys.length === 2) {
        const isFirstValueNumber = Number.isInteger(+data[dataKeys[0] as keyof typeof data])
        const isSecondValueNumber = Number.isInteger(+data[dataKeys[1] as keyof typeof data])
        if (isFirstValueNumber)
          graphicData = {...graphicData, [fieldAxisXLabels]: [ data[dataKeys[1] as keyof typeof data]], [fieldAxisYLabels]: [ data[dataKeys[0] as keyof typeof data]]}
        else if (isSecondValueNumber)
          graphicData = {...graphicData, [fieldAxisXLabels]: [ data[dataKeys[0] as keyof typeof data]], [fieldAxisYLabels]: [ data[dataKeys[1] as keyof typeof data]]}

      } 
      keysOfArraysAndObjects.length > 0 && keysOfArraysAndObjects.forEach((key: string, index: number) => {
        const callResult = this.recursiveProcessing(data[key as keyof typeof data], ++depth, index)
        graphicData = {...graphicData, ...callResult,}
      })
    }
    return graphicData
  }
}