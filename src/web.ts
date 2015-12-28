import {Querybase} from './Querybase';
import {QuerybaseUtils} from './QuerybaseUtils';
import {QuerybaseQuery} from './QuerybaseQuery';
import {indexify} from './QuerybaseIndex';

window["Querybase"] = Querybase;
window["QuerybaseUtils"] = QuerybaseUtils;
window["QuerybaseQuery"] = QuerybaseQuery;
window["Querybase"]["indexify"] = indexify; 