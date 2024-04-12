export class ChartDataModel{
    constructor(
        public labels?: string[]|number[],
        public datasets?: ChartDataModelProperty[], 
        
    ){}
}

export class ChartDataModelProperty {
    constructor(
        public data: string[]|number[],
        public label?: string,
        public backgroundColor?: string,
        public borderDash?:string[]|number[],
        public borderColor?:string
        
    ){}
}