export default class RecognizeTableData{
  
  public processData(data: Array<object> | object): string | object  {
    if (Array.isArray(data)) {
      return this.recursiveProcessing(data)
    } else {
      const dataKeys: Array<string> = Object.keys(data)
      const keysOfArrays: Array<string> = dataKeys.filter((elem: string) => Array.isArray(data[elem as keyof typeof data]))
      if (keysOfArrays.length == 0)
        return 'No data for table founded'
      let tablesData: object = {}
      keysOfArrays.forEach((el: string, index: number) => {
        const setOfKeys: Set<string> = new Set()
        let isKeysOfElementsNotEqual: boolean = false
        data[el as keyof typeof data].forEach((element: object) => {
          const elementKeys: Array<string> = Object.keys(element)
          elementKeys.forEach((key) => setOfKeys.add(key))
        })
        for (let element of data[el as keyof typeof data]) {
          const elementKeys: Array<string> = Object.keys(element)
          for (let key of setOfKeys) {
            if (!elementKeys.includes(key)){
              isKeysOfElementsNotEqual = true
              break
            }
          }
          if (isKeysOfElementsNotEqual) 
            break
        }
        if (!isKeysOfElementsNotEqual)
          tablesData = {...tablesData, ...this.recursiveProcessing(data[el as keyof typeof data], undefined, undefined, index)}
      })
      return Object.keys(tablesData).length > 0 ? tablesData : 'Some elements in array field does not have the same keys'
    }
  }
  
  recursiveProcessing<T extends object | string>(array: Array<T>, depth: number = 0, keyName?: string, index?: number): object {
    let tablesData: object = {}
    let depthCopy: number = depth
    const fieldArrayName = `rowDataField_${keyName ?? 'root'}${Number.isInteger(index) ? '_' : ''}${index ?? ''}`
    array.forEach((node: object, index: number) => {
      const nodeKeys: Array<string> = Object.keys(node)
      let nodeObject: object = {}
      nodeKeys.forEach((key: string) => {
        const arrayFieldData = fieldArrayName in tablesData && Array.isArray(tablesData[fieldArrayName as keyof typeof tablesData]) ? [...tablesData[fieldArrayName as keyof typeof tablesData]] : []
        if (Array.isArray(node[key as keyof typeof node])){
          nodeObject = {...nodeObject, [key]: 'array field'}
          tablesData = {...tablesData, [fieldArrayName]:[...arrayFieldData, {...nodeObject}], ...this.recursiveProcessing(node[key as keyof typeof node], ++depthCopy, key, index)}
        } else {
          nodeObject = {...nodeObject, [key]: node[key as keyof typeof node]}
          tablesData = {...tablesData, [fieldArrayName]: [ ...arrayFieldData ,{...nodeObject}] }
        }
      })
       tablesData[fieldArrayName as keyof typeof tablesData] = tablesData[fieldArrayName as keyof typeof tablesData].filter((el: object) => Object.keys(el).length == nodeKeys.length)
       tablesData[fieldArrayName.concat('_','columns') as keyof typeof tablesData] = [...nodeKeys]    
    })
    return tablesData
  }
}