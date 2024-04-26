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
        //console.log(graphicData)
      })
    } 
    else if (typeof data === 'object') {
      const dataKeys: Array<string> = Object.keys(data)
      const keysOfArraysAndObjects: Array<string> = dataKeys.filter((elem: string) => typeof data[elem as keyof typeof data] === 'object')
      const keysOfArrays: Array<String> = dataKeys.filter((elem: string) => Array.isArray(data[elem as keyof typeof data]))
      let depthCopy = ++depth
      let countOfArray = 0 
      if (keysOfArrays.length > 1) {
        const keysOfArraysConsOfNum: Array<string> = []
        keysOfArrays.forEach((key: string) => {
          let doArrayHaveNonNumbers: boolean = false
          data[key as keyof typeof data]?.forEach((element: number | object | string) => {
            if (!Number.isInteger(+element)) 
              doArrayHaveNonNumbers = true
          })
          if (!doArrayHaveNonNumbers) 
            keysOfArraysConsOfNum.push(key)
        })
        if (keysOfArraysConsOfNum.length > 0) {
          const fieldAxisXLabelsArray: string = `labelsX_${depthCopy}_`
          const fieldAxisYLabelsArray: string = `labelsY_${depthCopy}_`
          keysOfArraysConsOfNum.forEach((key: string, index: number) => {
            (fieldAxisYLabelsArray.concat('',`${countOfArray}`) in graphicData) && (fieldAxisXLabelsArray.concat('',`${countOfArray}`) in graphicData) && (countOfArray++)
            console.log()
            if (!(fieldAxisYLabelsArray.concat('',`${countOfArray}`) in graphicData) || !(fieldAxisXLabelsArray.concat('',`${countOfArray}`) in graphicData)) {
              if (!(fieldAxisYLabelsArray.concat('',`${countOfArray}`) in graphicData)) {
                graphicData[fieldAxisYLabelsArray.concat('',`${countOfArray}`) as keyof typeof graphicData] = [...data[key as keyof typeof data]]
              } else if (!(fieldAxisXLabelsArray.concat('',`${countOfArray}`) in graphicData)) {
                graphicData[fieldAxisXLabelsArray.concat('',`${countOfArray}`) as keyof typeof graphicData] = [...data[key as keyof typeof data]]
              }
            } else if ((index + 1) == keysOfArraysConsOfNum.length ) {
              graphicData = {...graphicData, [fieldAxisXLabelsArray.concat('',`${countOfArray}`)]: [...data[key as keyof typeof data]], [fieldAxisYLabelsArray.concat('',`${countOfArray}`)]: [...data[key as keyof typeof data]]}
            }
          })
        }
        keysOfArraysAndObjects.filter((key: string) => !keysOfArraysConsOfNum.includes(key))
      }
      if (dataKeys.length === 2) {
        const isFirstValueNumber = Number.isInteger(+data[dataKeys[0] as keyof typeof data])
        const isSecondValueNumber = Number.isInteger(+data[dataKeys[1] as keyof typeof data])
        if (isFirstValueNumber)
          graphicData = {...graphicData, [fieldAxisXLabels]: [ data[dataKeys[1] as keyof typeof data]], [fieldAxisYLabels]: [ data[dataKeys[0] as keyof typeof data]]}
        else if (isSecondValueNumber)
          graphicData = {...graphicData, [fieldAxisXLabels]: [ data[dataKeys[0] as keyof typeof data]], [fieldAxisYLabels]: [ data[dataKeys[1] as keyof typeof data]]}

      }
      keysOfArraysAndObjects.length > 0 && keysOfArraysAndObjects.forEach((key: string) => {
        !Array.isArray(data[key as keyof typeof data]) && ++countOfArray
        const callResult = this.recursiveProcessing(data[key as keyof typeof data], depthCopy, countOfArray)
        graphicData = {...graphicData, ...callResult,}
      })
    }
    return graphicData
  }
}