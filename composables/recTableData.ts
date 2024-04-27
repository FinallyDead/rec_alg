export default class RecognizeTableData{
  //TODO Сделать обработку вложенного в объект объекта, а то сейчас ток обработка вложенных массивов
  public processData(data: Array<object> | object): string | object  {
      const tablesData = this.recursiveProcessing(data)
      return Object.keys(tablesData).length > 0 ? tablesData : 'Some elements in array field does not have the same keys'
  }
  
  recursiveProcessing<T extends object | string>(array: Array<T> | object, depth: number = 0, keyName?: string, index?: number): object {
    let tablesData: object = {}
    let depthCopy: number = depth
    const fieldArrayName: string = `rowDataField_${keyName ?? 'root'}${Number.isInteger(index) ? '_' : ''}${index ?? ''}`
    //console.log(array)
    if(Array.isArray(array)) {
      array.forEach((node: object, index: number) => {
        const nodeKeys: Array<string> = Object.keys(node)
        let nodeObject: object = {}
        nodeKeys.forEach((key: string) => {
          const arrayFieldData = fieldArrayName in tablesData && Array.isArray(tablesData[fieldArrayName as keyof typeof tablesData]) ? [...tablesData[fieldArrayName as keyof typeof tablesData]] : []
          if (Array.isArray(node[key as keyof typeof node])){
            nodeObject = {...nodeObject, [key]: 'array field'}
            tablesData = {...tablesData, [fieldArrayName]: [ ...arrayFieldData, {...nodeObject}], ...this.recursiveProcessing(node[key as keyof typeof node], ++depthCopy, key, index)}
          } else if(typeof node[key as keyof typeof node] === 'object') {
            nodeObject = {...nodeObject, [key]: 'object field'}
            tablesData = {...tablesData, [fieldArrayName]: [ ...arrayFieldData, {...nodeObject}], ...this.recursiveProcessing(node[key as keyof typeof node], ++depthCopy, key, index)}
          } else {
            nodeObject = {...nodeObject, [key]: node[key as keyof typeof node]}
            tablesData = {...tablesData, [fieldArrayName]: [ ...arrayFieldData ,{...nodeObject}] }
          }
        })
        tablesData[fieldArrayName as keyof typeof tablesData] = tablesData[fieldArrayName as keyof typeof tablesData].filter((el: object) => Object.keys(el).length == nodeKeys.length)
        tablesData[fieldArrayName.concat('_','columns') as keyof typeof tablesData] = [...nodeKeys]    
      })
    } else if (typeof array === 'object') {
      const dataKeys: Array<string> = Object.keys(array)
      const keysOfArrays: Array<string> = dataKeys.filter((elem: string) => Array.isArray(array[elem as keyof typeof array]))
      keysOfArrays.length > 0 && keysOfArrays.forEach((el: string, index: number) => {
        const setOfKeys: Set<string> = new Set()
        let isKeysOfElementsNotEqual: boolean = false
        array[el as keyof typeof array].forEach((element: object) => {
          const elementKeys: Array<string> = Object.keys(element)
          elementKeys.forEach((key) => setOfKeys.add(key))
        })
        for (let element of array[el as keyof typeof array]) {
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
          tablesData = {...tablesData, ...this.recursiveProcessing(array[el as keyof typeof array], undefined, undefined, index)}
      })
    }
    return tablesData
  }
}