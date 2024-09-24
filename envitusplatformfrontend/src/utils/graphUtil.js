import { chartColors } from '../constants';

export const processGraphArrays = (chartName, chartValue, chartDates, countIteration, color) => {
    const minDateDomain = chartDates[0];
    const maxDateDomain = chartDates[chartDates.length - 1];

    const countParamName = [];
    countParamName.push({count:countIteration, name: chartName}); 

    const datesValues= [];
    for (let index = 0; index < chartValue.length; index++) {
        let tempObject;
        if(color){
            tempObject = {
                date: chartDates[index],
                paramValue: chartValue[index],
                limitColor: color[index]
            };
        } else {
            tempObject = {
                date: chartDates[index],
                paramValue: chartValue[index]
            };
        }
        datesValues.push(tempObject);    
    }

    const graphInputArrays = {
        countParamName: countParamName, datesValues: datesValues, minDateDomain: minDateDomain,
        maxDateDomain: maxDateDomain
    }
    return graphInputArrays;
};


export const setYaxisAttr = (countIteration) => {
    let yAxisName;
    let transformAmt;
    switch(countIteration) {
    case 0:
        yAxisName = ".y1-axis";
        transformAmt = 0;
        break;
    case 1:
        yAxisName = ".y2-axis";
        transformAmt = 570;
        break;
    case 2:
        yAxisName = ".y3-axis";
        transformAmt = -50;
        break;
    case 3:
        yAxisName = ".y4-axis";
        transformAmt = 620;
        break;
    }

    const yaxisAttr = {
        yAxisName: yAxisName, transformAmt: transformAmt, strokeColor: chartColors[countIteration]
    }
    return yaxisAttr;
};
