import * as request from 'request';
import * as Promise from 'bluebird';
import * as cheerio from 'cheerio';
import { Requester, Parser, Problem } from './index';

export class LuoguRequester implements Requester {
    query(id: Number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            request.get(
                {
                    url: 'https://www.luogu.org/problem/show/?pid=' + id,
                    encoding: 'utf8'
                },
                function (error, response, body) {
                    if (response && response.statusCode && response.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(error);
                    }
                }
            );
        });
    }
}

export class LuoguParser implements Parser {
    parse(html: string): Problem {
        const problem = new Problem();
        const dom = cheerio.load(html);
        problem.title = dom('h1').first().text().trim();
        const lg_article = dom('.lg-article');
        const id = dom('h1').first().text().trim();
        problem.id = parseInt(id.substring(id.indexOf("P") + "P".length, id.indexOf("P") + "P".length + 4).trim());
        problem.description = this.parseDescription(lg_article);
        problem.inputFormat = this.parseInputFormat(lg_article);
        problem.outputFormat = this.parseOutputFormat(lg_article);
        problem.inputExample = this.parseInputExample(lg_article);
        problem.outputExample = this.parseOutputExample(lg_article);
        problem.notes = this.parseNotes(lg_article);
        return problem;
    }

    parseDescription(domObject: Cheerio): string {
        let description: string = domObject.first().text();
        description = description.substring(description.indexOf("题目描述\n") + "题目描述\n".length, description.indexOf(" 输入输出格式")).trim();
        return description;
    }

    parseInputFormat(domObject: Cheerio): string {
        let description: string = domObject.first().text();
        description = description.substring(description.indexOf("输入格式：\n") + "输入格式：\n".length, description.indexOf("\n输出格式")).trim();
        return description;
    }

    parseOutputFormat(domObject: Cheerio): string {
        let description: string = domObject.first().text();
        description = description.substring(description.indexOf("输出格式：\n") + "输出格式：\n".length, description.indexOf("\n输入输出样例")).trim();
        return description;
    }

    parseInputExample(domObject: Cheerio): Array<Array<string>> {
        let description: string = domObject.first().text();
        description = description.substring(description.indexOf("输入样例#") + "输入样例#".length, description.indexOf("\n\n\n输出样例"));
        let ret = new Array();
        let formatArr = description.split("：");
        let pointer: number = 0;
        for (let i = 0; i < formatArr.length; i++) {
            if (parseInt(formatArr[i]).toString() === formatArr[i]) {
                pointer = parseInt(formatArr[i]);
            } else {
                let sp = formatArr[i].split("\n");
                sp = cleanArray(sp);
                ret[pointer] = sp;
            }
        }
        ret = cleanArray(ret);
        return ret;
    }

    parseOutputExample(domObject: Cheerio): Array<Array<string>> {
        let description: string = domObject.first().text();
        description = description.substring(description.lastIndexOf("输出样例#") + "输出样例#".length, (description.indexOf("说明") !== 0 ? description.indexOf("说明") : undefined));
        let ret = new Array();
        let formatArr = description.split("：");
        let pointer: number = 0;
        for (let i = 0; i < formatArr.length; i++) {
            if (parseInt(formatArr[i]).toString() === formatArr[i]) {
                pointer = parseInt(formatArr[i]);
            } else {
                let sp = formatArr[i].split("\n");
                sp = cleanArray(sp);
                ret[pointer] = sp;
            }
        }
        ret = cleanArray(ret);
        return ret;
    }

    parseNotes(domObject: Cheerio): string {
        let description: string = domObject.first().text();
        if (description.indexOf("说明") !== 0)
            return description.substring(description.indexOf("说明") + "说明".length);
        else
            return "";
    }

}

function cleanArray(actual: Array<any>) {
    let newArray = new Array();
    for (let i = 0; i < actual.length; i++) {
        if (actual[i] && actual[i] != "" && actual[i] != " ") {
            newArray.push(actual[i]);
        }
    }
    return newArray;
}