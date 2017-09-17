import * as request from 'request';
import * as Promise from 'bluebird';
import * as cheerio from 'cheerio';
import { Requester, Parser, Problem } from './index';

export class POJRequester implements Requester {
    query(id: Number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            request.get(
                {
                    url: 'http://poj.org/problem?id=' + id,
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

export class POJParser implements Parser {
    parse(html: string): Problem {
        const problem = new Problem();
        const dom = cheerio.load(html);
        problem.id = parseInt(dom('title').text().substring(0, 4));
        problem.title = dom('title').text().substring(8);
        problem.description = dom('.ptx').first().text();
        problem.inputFormat = dom('.ptx').eq(1).text();
        problem.outputFormat = dom('.ptx').eq(2).text();
        problem.inputExample = this.parseInputExample(dom('.sio').first());
        problem.outputExample = this.parseOutputExample(dom('.sio').eq(1));
        problem.notes = dom('.ptx').eq(3).text();
        return problem;
    }

    parseInputExample(domObject: Cheerio): Array<Array<string>> {
        let a = new Array();
        let description = domObject.text();
        if (description.indexOf('#') === ("Sample Input #".length - 1)) {
            let tmp = description.split("Sample Input #");
            cleanArray(tmp);
            for (let i = 0; i < tmp.length; i++) {
                let splitted = tmp[i].split("\n\n", 2);
                if (splitted && splitted[0] !== '')
                    a.push(splitted[1].split('\n'));
            }
        } else {
            a.push(cleanArray(description.split('\n')));
        }
        cleanArray(a);
        return a;
    }

    parseOutputExample(domObject: Cheerio): Array<Array<string>> {
        let a = new Array();
        let description = domObject.text();
        if (description.indexOf('#') === ("Sample Output #".length - 1)) {
            let tmp = description.split("Sample Output #");
            cleanArray(tmp);
            for (let i = 0; i < tmp.length; i++) {
                let splitted = tmp[i].split("\n\n", 2);
                if (splitted && splitted[0] !== '')
                    a.push(splitted[1].split('\n'));
            }
        } else {
            a.push(cleanArray(description.split('\n')));
        }
        cleanArray(a);
        return a;
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