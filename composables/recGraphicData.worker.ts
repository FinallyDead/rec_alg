declare const self: DedicatedWorkerGlobalScope
export {}
self.addEventListener('message', function(e) {
  const graphicData = recursiveProcessing(e.data)
  self.postMessage(Object.keys(graphicData).length > 0 ? graphicData : 'There is no data for graphic visualization')
  self.close()
}, false)

  
 function recursiveProcessing<T extends object | string | number>(data: Array<T> | object, depth: number = 0, nodeIndex?: number, levelIndex?: number): object {
    let graphicData: object = {}
    const fieldAxisXLabels: string = `labelsX_${depth == 0 ? 'root' : depth}${Number.isInteger(nodeIndex) ? '_' : ''}${nodeIndex ?? ''}${Number.isInteger(levelIndex) ? '_' : ''}${levelIndex ?? ''}`
    const fieldAxisYLabels: string = `labelsY_${depth == 0 ? 'root' : depth}${Number.isInteger(nodeIndex) ? '_' : ''}${nodeIndex ?? ''}${Number.isInteger(levelIndex) ? '_' : ''}${levelIndex ?? ''}`
    if (Array.isArray(data)) {
      data.forEach((node: object | string | number,index: number) => {
        const graphicAxisXFieldData = fieldAxisXLabels in graphicData && Array.isArray(graphicData[fieldAxisXLabels as keyof typeof graphicData]) 
          ? [...graphicData[fieldAxisXLabels as keyof typeof graphicData]] 
          : []
        const graphicAxisYFieldData = fieldAxisYLabels in graphicData && Array.isArray(graphicData[fieldAxisYLabels as keyof typeof graphicData]) 
          ? [...graphicData[fieldAxisYLabels as keyof typeof graphicData]] 
          : []
        let depthCopy: number = depth
        if (typeof node === 'object' && typeof node !== 'string') {
          const callResult = recursiveProcessing(node, ++depthCopy, index, levelIndex)
          const resultKeys = Object.keys(callResult)
          if (resultKeys.length >= 2)
            fieldAxisXLabels == 'labelsX_root' 
            ? graphicData = {...graphicData, ...callResult }
            : graphicData = {...graphicData, [fieldAxisXLabels]: [...graphicAxisXFieldData,...callResult[resultKeys[0] as keyof typeof callResult]], [fieldAxisYLabels]: [...graphicAxisYFieldData,...callResult[resultKeys[1] as keyof typeof graphicData]]}
        } 
      })
    } 
    else if (typeof data === 'object') {
      const dataKeys: Array<string> = Object.keys(data)
      let keysOfArraysAndObjects: Array<string> = dataKeys.filter((elem: string) => typeof data[elem as keyof typeof data] === 'object')
      const keysOfArrays: Array<String> = dataKeys.filter((elem: string) => Array.isArray(data[elem as keyof typeof data]))
      let depthCopy: number = ++depth
      let countOfArray: number = 0 

      if (keysOfArrays.length > 1) {
        const keysOfArraysConsOfNum: Array<string> = []
        const keysOfArraysConsOfStr: Array<string> = []

        keysOfArrays.forEach((key: string) => {
          let doArrayHaveNonNumbers: boolean = false
          let doArrayHaveNonStrings: boolean = false
          data[key as keyof typeof data]?.forEach((element: number | object | string) => {
            if (!Number.isInteger(+element)) 
              doArrayHaveNonNumbers = true
            if (typeof element !== 'string')
              doArrayHaveNonStrings = true
          })
          if (!doArrayHaveNonNumbers) 
            keysOfArraysConsOfNum.push(key)
          if (!doArrayHaveNonStrings) 
            keysOfArraysConsOfStr.push(key)
        })

        if (keysOfArraysConsOfNum.length > 0 && keysOfArraysConsOfStr.length > 0) {
          const fieldAxisXLabelsArray: string = `labelsX_${depthCopy}_`
          const fieldAxisYLabelsArray: string = `labelsY_${depthCopy}_`
          keysOfArraysConsOfNum.forEach((key: string, index: number) => { 
            (fieldAxisYLabelsArray.concat('',`${countOfArray}`) in graphicData) && (fieldAxisXLabelsArray.concat('',`${countOfArray}`) in graphicData) && (countOfArray++)
            if (!(fieldAxisYLabelsArray.concat('',`${countOfArray}`) in graphicData) || !(fieldAxisXLabelsArray.concat('',`${countOfArray}`) in graphicData)) {
              if (keysOfArraysConsOfStr.length >= (index + 1) ){
                if (!(fieldAxisYLabelsArray.concat('',`${countOfArray}`) in graphicData)) {
                  graphicData[fieldAxisYLabelsArray.concat('',`${countOfArray}`) as keyof typeof graphicData] = [...data[key as keyof typeof data]]
                }
                if (!(fieldAxisXLabelsArray.concat('',`${countOfArray}`) in graphicData)) { 
                  const stringLabelKey = keysOfArraysConsOfStr[index]
                  graphicData[fieldAxisXLabelsArray.concat('',`${countOfArray}`) as keyof typeof graphicData] = [...data[stringLabelKey as keyof typeof data]]
                }
              } else {
                  if (!(fieldAxisYLabelsArray.concat('',`${countOfArray}`) in graphicData) && (index + 1) != keysOfArraysConsOfNum.length) {
                    graphicData[fieldAxisYLabelsArray.concat('',`${countOfArray}`) as keyof typeof graphicData] = [...data[key as keyof typeof data]]
                  } else if (!(fieldAxisXLabelsArray.concat('',`${countOfArray}`) in graphicData) && (index + 1) != keysOfArraysConsOfNum.length) {
                    graphicData[fieldAxisXLabelsArray.concat('',`${countOfArray}`) as keyof typeof graphicData] = [...data[key as keyof typeof data]]
                  }
                  if ((index + 1) == keysOfArraysConsOfNum.length ) {
                    graphicData = {...graphicData, [fieldAxisXLabelsArray.concat('',`${countOfArray}`)]: [...data[key as keyof typeof data]], [fieldAxisYLabelsArray.concat('',`${countOfArray}`)]: [...data[key as keyof typeof data]]}
                  }
              }
            }
          })
          keysOfArraysAndObjects = keysOfArraysAndObjects.filter((key: string) => !keysOfArraysConsOfNum.includes(key) || !keysOfArraysConsOfStr.includes(key))
        }

        if (keysOfArraysConsOfNum.length > 0 && keysOfArraysConsOfStr.length == 0) {
         graphicData = {...graphicData, ...processNumberArrays(data, depthCopy, countOfArray, graphicData, keysOfArraysConsOfNum)}
         keysOfArraysAndObjects = keysOfArraysAndObjects.filter((key: string) => !keysOfArraysConsOfNum.includes(key))
        }
      }

      if (dataKeys.length === 2) {
        const isFirstValueNumber: boolean = Number.isInteger(+data[dataKeys[0] as keyof typeof data])
        const isSecondValueNumber: boolean = Number.isInteger(+data[dataKeys[1] as keyof typeof data])
        if (isFirstValueNumber)
          graphicData = {...graphicData, [fieldAxisXLabels]: [ data[dataKeys[1] as keyof typeof data]], [fieldAxisYLabels]: [ data[dataKeys[0] as keyof typeof data]]}
        else if (isSecondValueNumber)
          graphicData = {...graphicData, [fieldAxisXLabels]: [ data[dataKeys[0] as keyof typeof data]], [fieldAxisYLabels]: [ data[dataKeys[1] as keyof typeof data]]}

      }
      keysOfArraysAndObjects.length > 0 && keysOfArraysAndObjects.forEach((key: string) => {
        !Array.isArray(data[key as keyof typeof data]) && ++countOfArray
        const callResult = recursiveProcessing(data[key as keyof typeof data], depthCopy, countOfArray, nodeIndex)
        graphicData = {...graphicData, ...callResult,}
      })
    }
    return graphicData
  }


function  processNumberArrays<T extends object | string | number>(data: Array<T> | object, depthCopy: number, countOfArray: number, graphicData: object, keysOfArraysConsOfNum: Array<string>): object {
    const fieldAxisXLabelsArray: string = `labelsX_${depthCopy}_`
    const fieldAxisYLabelsArray: string = `labelsY_${depthCopy}_`
    keysOfArraysConsOfNum.forEach((key: string, index: number) => {
      (fieldAxisYLabelsArray.concat('',`${countOfArray}`) in graphicData) && (fieldAxisXLabelsArray.concat('',`${countOfArray}`) in graphicData) && (countOfArray++)
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
    return graphicData
  }
