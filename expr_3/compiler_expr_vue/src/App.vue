<template>
  <el-row :gutter="20">
    <el-col :span="2"></el-col>
    <el-col :span="20">
      <el-row :gutter="20">
        <el-col :span="22">
          <h1>编译原理实验环境</h1>
        </el-col>
        <el-col :span="2">
          <el-button type="success" round v-on:click="loadFile"
            >加载文件</el-button
          >
        </el-col>
      </el-row>

      <h2>1 词法分析</h2>
      <el-row :gutter="20">
        <el-col :span="22"
          ><el-input
            type="textarea"
            :autosize="{ minRows: 5 }"
            placeholder="请输入源代码"
            v-model="RawLex"
          >
          </el-input
        ></el-col>
        <el-col :span="2"
          ><el-button type="primary" v-on:click="Lex_parser"
            >词法分析</el-button
          ></el-col
        >
      </el-row>

      <br />

      <el-row :gutter="20">
        <el-col :span="24"
          ><el-input
            type="textarea"
            :autosize="{ minRows: 5 }"
            placeholder="词法分析结果"
            v-model="LexResult"
            disabled
          >
          </el-input
        ></el-col>
      </el-row>

      <br />

      <h2>2 语法分析</h2>

      <el-row :gutter="20">
        <el-col :span="22">
          <el-input
            type="textarea"
            :autosize="{ minRows: 1 }"
            placeholder="请输入终结符,以\分割,不要包含空格"
            v-model="RawTerminalSymbols"
          ></el-input>
        </el-col>

        <el-col :span="2">
          <el-button type="primary" v-on:click="grammar_parser">
            语法分析
          </el-button>
        </el-col>
      </el-row>

      <br />

      <el-row :gutter="20">
        <el-col>
          <el-input
            type="textarea"
            :autosize="{ minRows: 5 }"
            placeholder="请输入语法"
            v-model="RawGrammar"
          ></el-input>
        </el-col>
      </el-row>

      <h3>2.1 DFA</h3>

      <vue3-mermaid :nodes="graph" type="graph TD" :key="graph"></vue3-mermaid>
      <!-- v-if="renderGraph" -->
      <h3>2.2 SLR分析表</h3>
      <el-table :data="SLRtableData" style="width: 100%" height="650" stripe>
        <el-table-column fixed prop="num" label=" " width="50">
        </el-table-column>
        <el-table-column label="ACTION">
          <el-table-column
            v-for="s in SLRtableCol1"
            v-bind:key="s"
            :prop="s"
            :label="s"
          ></el-table-column>
        </el-table-column>
        <el-table-column label="GOTO">
          <el-table-column
            v-for="s in SLRtableCol2"
            v-bind:key="s"
            :prop="s"
            :label="s"
          ></el-table-column>
        </el-table-column>
      </el-table>

      <br />

      <h3>2.3 输入归约规则</h3>
      <el-row :gutter="20">
        <el-col :span="6"> 原表达式 </el-col>
        <el-col :span="12"></el-col>
        <el-col :span="4">
          <el-button type="primary" v-on:click="GrammarFunctionReturner"
            >确认归约规则，构建语法树</el-button
          >
        </el-col>
        <el-col :span="2"></el-col>
      </el-row>
      <el-row :gutter="20" v-for="s in GrammarFunction" v-bind:key="s.str">
        <el-col :span="6">
          {{ s.str }}
        </el-col>
        <el-col :span="18">
          <el-input
            type="textarea"
            :autosize="{ minRows: 5, maxRows: 5 }"
            placeholder="请输入归约规则"
            v-model="s.FuncStr"
          ></el-input>
        </el-col>
      </el-row>

      <br />
      <h3>2.4 自底向上LR归约步骤</h3>
      <el-table :data="tableProcess" border style="width: 100%">
        <el-table-column prop="idx" label="步骤"></el-table-column>
        <el-table-column prop="state" label="状态栈"></el-table-column>
        <el-table-column prop="sym" label="符号栈"></el-table-column>
        <el-table-column prop="next" label="Next"></el-table-column>
        <el-table-column prop="act" label="动作说明"></el-table-column>
      </el-table>

      <br />

      <h3>2.5 语法树</h3>
      <!-- <vue3-mermaid
    :nodes="treeGraph"
    type="graph TD"
    :key="treeGraph"
  ></vue3-mermaid> -->
      <!-- <Tree :treeGraph="treeGraph" /> -->
      <el-input
        type="textarea"
        :autosize="{ minRows: 5 }"
        placeholder="语法树"
        v-model="treeText"
        disabled
      ></el-input>

      <br />

      <h3>2.6 三地址码</h3>
      <el-input
        type="textarea"
        :autosize="{ minRows: 5 }"
        placeholder="三地址码"
        v-model="Result"
        disabled
      ></el-input>
    </el-col>
    <el-col :span="2"></el-col>
  </el-row>
</template>

<script>
import axios from "axios";
// import Tree from "./components/tree";
import { ElMessage } from "element-plus";
export default {
  name: "App",
  components: {
    // Tree,
  },
  data() {
    return {
      readFile: false,
      RawLex: "",
      LexResult: "",
      LexStream: [],

      RawTerminalSymbols: "",
      TerminalSymbols: new Set(), // 终结符
      unTerminalSymbols: new Set(), // 非终结符
      RawGrammar: "",
      GrammarStream: [],
      first: {}, // FIRST集
      follow: {}, // FOLLOW集合
      itemSet: [], // 项目集
      itemfamily: [], // 项目规范族
      goMap: [], // Go函数
      ACTION: [],
      GOTO: [],
      graph: [
        // {
        //   id: "0",
        //   text: '"S\' -> . S</br>S -> . L</br>L -> . P</br>P -> . ;"',
        //   link: ["-- S -->", "-- P -->", "-- L -->", '-- ";" -->'],
        //   next: ["1", "2", "3", "4"],
        // },
        // {
        //   id: "1",
        //   text: '"S\' -> S ."',
        //   link: [],
        //   next: [],
        // },
        // {
        //   id: "2",
        //   text: '"S -> L ."',
        //   link: [],
        //   next: [],
        // },
        // {
        //   id: "3",
        //   text: '"L -> P ."',
        //   link: [],
        //   next: [],
        // },
        // {
        //   id: "4",
        //   text: '"P -> ; ."',
        //   link: [],
        //   next: [],
        // },
      ],
      SLRtableData: [],
      SLRtableCol1: [],
      SLRtableCol2: [],

      GrammarFunction: [],
      placeNum: -1,
      labelNum: -1,

      tableProcess: [],
      stepProcess: 0,
      Result: "三地址码",
      treeText: "",

      errorText: "",
    };
  },
  methods: {
    loadFile() {
      axios.get("./a.json").then((res) => {
        console.log("res.data = ", res.data);
        this.RawLex = res.data["rawLex"];
        this.RawTerminalSymbols = res.data["terminalSymbols"];
        this.RawGrammar = res.data["rawGrammar"];
        this.GrammarFunction = res.data["GrammarFuntion"];
        this.readFile = true;
      });
    },
    Lex_parser() {
      this.LexResult = "";
      var regexp = /(0(?:x|X)[a-fA-F0-9]+(?:\.[0-9a-fA-F]+){0,1})|(0[0-7]+(?:\.[0-7]+){0,1})|(if|then|else|while|do)|([a-zA-Z](?:[a-zA-Z]|\d)*(?:_|\.(?:[a-zA-Z]|\d)+){0,1})|([0-9]+(?:\.[0-9]+){0,1})|(\+|-|\*|\/|>|<|=|\(|\)|;)/g;
      var rs;
      var i;
      while ((rs = regexp.exec(this.RawLex)) != null) {
        if (rs[1]) {
          // 16进制
          // 分为整数部分和小数部分
          let tmp = rs[0].split(".");
          // 整数16进制转为10进制
          // let num = parseInt(eval(tmp[0]).toString(10));
          let num = parseInt(parseInt(tmp[0], 16).toString(10));
          // 若存在小数，将小数转为10进制
          if (tmp.length > 1)
            for (i = 0; i < tmp[1].length; i++)
              num += parseInt(tmp[1][i], 16) / 16 ** (i + 1);
          // console.log("INT 16\t",num);
          this.LexResult += "INT16\t" + num + "\n";
          this.LexStream.push({ type: "INT16", attribute: num });
        } else if (rs[2]) {
          // 8进制，同16进制
          let tmp = rs[0].split(".");
          // console.log(tmp);
          // let num = parseInt(eval(tmp[0]).toString(10));
          let num = parseInt(parseInt(tmp[0], 8).toString(10));
          if (tmp.length > 1)
            for (i = 0; i < tmp[1].length; i++)
              num += parseInt(tmp[1][i], 8) / 8 ** (i + 1);
          // console.log("INT 8\t",num);
          this.LexResult += "INT8\t" + num + "\n";
          this.LexStream.push({ type: "INT8", attribute: num });
        } else if (rs[3]) {
          // 保留关键字，转换为大写输出
          // console.log(rs[0].toLocaleUpperCase(),"\t _");
          this.LexResult += rs[0].toLocaleUpperCase() + "\t _" + "\n";
          this.LexStream.push({
            type: rs[0].toLocaleUpperCase(),
            attribute: "_",
          });
        } else if (rs[4]) {
          // 标识符
          // console.log("IDN\t",rs[0]);
          this.LexResult += "IDN\t" + rs[0] + "\n";
          this.LexStream.push({ type: "IDN", attribute: rs[0] });
        } else if (rs[5]) {
          // 10进制
          // console.log("INT 10\t",rs[0]);
          this.LexResult += "INT10\t" + rs[0] + "\n";
          this.LexStream.push({ type: "INT10", attribute: rs[0] });
        } else if (rs[6]) {
          // 运算符和分隔符
          // console.log(rs[0],"\t _");
          this.LexResult += rs[0] + "\t _" + "\n";
          this.LexStream.push({ type: rs[0], attribute: "_" });
        }
      }

      this.LexStream.push({ type: "#", attribute: "_" });
      console.log("词法输入栈：", this.LexStream);
    },
    init_grammar_parser() {
      // 初始化
      this.GrammarStream = [];
      this.TerminalSymbols = new Set(); // 终结符
      this.unTerminalSymbols = new Set(); // 非终结符
      this.GrammarStream = [];
      this.first = {}; // FIRST集
      this.follow = {}; // FOLLOW集合
      this.itemSet = []; // 项目集
      this.itemfamily = []; // 项目规范族
      this.goMap = []; // Go函数
      this.graph = [];
      this.ACTION = [];
      this.GOTO = [];
      this.SLRtableData = [];
      this.SLRtableCol1 = [];
      this.SLRtableCol2 = [];
      if (!this.readFile) this.GrammarFunction = [];
      this.placeNum = -1;

      this.tableProcess = [];
      this.stepProcess = 0;
      this.Result = "Fuck";
    },
    grammar_parser() {
      this.init_grammar_parser();

      // 生成终结符集
      this.TerminalSymbols = this.RawTerminalSymbols.split(" ").filter(
        (d) => d != " "
      );
      console.log("终结符：", this.TerminalSymbols);

      // 将文法结构化为{left:"xxx",right:["xx","xx"],dot:0}
      // console.log(this.RawGrammar);
      this.RawGrammar.split("\n").forEach((line) => {
        // console.log(":",line);
        if (line == "") return;
        // console.log(this.genGrammar(line));
        this.GrammarStream.push(this.genGrammar(line));
      });
      this.GrammarStream.unshift({
        left: "S'",
        right: [this.GrammarStream[0]["left"]],
        dot: 0,
      });
      console.log("结构化文法", this.GrammarStream);

      // 初始化文法对应的函数集合
      if (!this.readFile)
        for (let s of this.GrammarStream) {
          this.GrammarFunction.push({
            str: s["left"] + "->" + s["right"].join(" "),
            FuncStr: "",
          });
        }

      // 生成非终结符集
      for (let g of this.GrammarStream)
        for (let c of g["right"])
          if (!this.TerminalSymbols.includes(c)) {
            this.unTerminalSymbols.add(c);
          }
      console.log("非终结符集：", this.unTerminalSymbols);

      // 求FIRST集合
      this.handleFIRST();
      console.log("FIRST集：", this.first);
      // 求FOLLOW集合
      this.handleFOLLOW();
      console.log("FOLLOW集：", this.follow);

      // 生成项目集
      // 生成每个产生式,dot在每个位置的状态
      for (let i = 0; i < this.GrammarStream.length; i++) {
        for (let j = 0; j < this.GrammarStream[i]["right"].length; j++) {
          this.itemSet.push({
            left: this.GrammarStream[i]["left"],
            right: this.GrammarStream[i]["right"],
            dot: j,
          });
        }
      }
      console.log("项目集：", this.itemSet)
      // console.log("项目集：", JSON.parse(JSON.stringify(this.itemSet)));

      // 生成项目规范族
      this.itemfamily.push(this.closure([this.itemSet[0]]));//push入第一个状态
      console.log("初始项目规范族：", JSON.parse(JSON.stringify(this.itemfamily)));
      this.genItemFamily();
      console.log("项目规范族：", this.itemfamily);
      console.log("goMap:", this.goMap);

      // 生成mermaid-DFA图
      this.showDFA();

      // 生成ACTION、GOTO
      this.genACTIONGOTO();
      this.showSLRSheet();
    },
    genGrammar(str) {
      let gen = str.split("->");
      if (gen.length != 2) {
        console.error("文法错误: 生成式不分为左右两个部分");
        console.log(gen);
      }
      if (gen[0].length != 1) {
        console.error("文法错误: 生成式左侧不止一个变量");
        console.log(gen);
      }
      var left = gen[0]; //提取箭头左侧
      var right = gen[1].split(" ").filter((d) => d != " "); //提取箭头右侧并去除所有空元素
      return { left: left, right: right, dot: 0 };
    },
    handleFIRST() {
      this.first["S'"] = [];
      for (let sign of this.unTerminalSymbols) this.first[sign] = [];
      let flag = true;
      while (flag) {
        // console.log("FIRST集：",this.first);
        flag = false;
        for (let g of this.GrammarStream) {
          let pos = 0;
          while (pos < g["right"].length) {
            if (this.unTerminalSymbols.has(g["right"][pos])) {
              // A->·BC, 把FIRST(B)加入FIRST(A)
              for (let f of this.first[g["right"][pos]]) {
                if (!this.first[g["left"]].includes(f) && f != "e") {
                  this.first[g["left"]].push(f);
                  flag = true;
                }
              }
              if (this.first[g["right"][pos]].includes("e")) {
                // FIRST(B)包含epsilon,则继续看C
                pos += 1;
              } else {
                break;
              }
            } else {
              // A->a, 把a加入到FIRST(A)
              if (!this.first[g["left"]].includes(g["right"][pos])) {
                this.first[g["left"]].push(g["right"][pos]);
                flag = true;
              }
              break;
            }
          }
        }
      }
    },
    handleFOLLOW() {
      this.follow["S'"] = ["#"];
      for (let sign of this.unTerminalSymbols) this.follow[sign] = [];
      let flag = true;
      while (flag) {
        flag = false;
        // U->...AB...
        for (let g of this.GrammarStream) {
          //对每一个产生式进行
          let pos = 0; // 找到非终结符
          let ppos = 0; // 找到非终结符后的其他终结符
          while (pos < g["right"].length) {
            if (this.unTerminalSymbols.has(g["right"][pos])) {
              ppos = pos + 1;
              if (ppos == g["right"].length) {
                for (let f of this.follow[g["left"]]) //U的FOLLOW集加入产生式最右端的非终结符的FOLLOW(注意去重)
                  if (!this.follow[g["right"][pos]].includes(f)) {
                    this.follow[g["right"][pos]].push(f);
                    flag = true;
                  }
                break;
              }
              while (ppos < g["right"].length) {
                //循环,直到遇到终结符/FIRST集不含空的非终结符/产生式右侧末尾
                if (this.unTerminalSymbols.has(g["right"][ppos])) {
                  //该位是非终结符B
                  for (let f of this.first[g["right"][ppos]]) {
                    //将B的FIRST集加入A的FOLLOW集(自带去重)
                    if (!this.follow[g["right"][pos]].includes(f) && f != "e") {
                      this.follow[g["right"][pos]].push(f);
                      flag = true;
                    }
                  }
                  if (this.first[g["right"][ppos]].includes("e")) ppos += 1;
                  //如果B的FIRST含空,继续看下一位
                  else {
                    //不含空,本产生式可以找到的A的FOLLOW已经全部搜索完毕,跳出循环看下一个
                    pos += 1;
                    break;
                  }
                } else {
                  //该位是终结符,将其放入A的FOLLOW集(去重)
                  if (
                    !this.follow[g["right"][pos]].includes(g["right"][ppos])
                  ) {
                    this.follow[g["right"][pos]].push(g["right"][ppos]);
                    flag = true;
                  }
                  pos += 1;
                  break;
                }

                if (ppos == g["right"].length) {
                  //U的FOLLOW集加入产生式最右端的非终结符的FOLLOW(注意去重)
                  // A->αB 或  A->αBβ 且 β=>e
                  for (let f of this.follow[g["left"]]) {
                    if (!this.follow[g["right"][pos]].includes(f)) {
                      this.follow[g["right"][pos]].push(f);
                      flag = true;
                    }
                  }
                }
              }
            } else {
              //跳过A是终结符的时候
              pos += 1;
            }
          }
        }
      }
    },
    closure(item) {
      //求闭包
      let result = []; // 闭包结果集
      for (let i of item) result.push(i); // 先把初始值放入集合
      // 对集合中的每一个添加新元素
      // 如果有新元素加入，那么result.length也增加，即可保证最后结果是不在增加的
      for (let i = 0; i < result.length; i++) {
        item = result[i];
        if (!this.unTerminalSymbols.has(item["right"][item["dot"]]))
          // A->·ab 的情况，不用管
          continue;
        for (let j = 0; j < this.itemSet.length; j++) {
          // 发现S->·A 找到项目集中的A->·ab并插入闭包结果集
          if (
            this.itemSet[j]["left"] == item["right"][item["dot"]] &&
            this.itemSet[j]["dot"] == 0 &&
            !this.itemsInclude(result, this.itemSet[j])
          )
            // 判断闭包结果集中是否已经存在该项目
            result.push(this.itemSet[j]);
        }
      }
      return result;
    },
    itemsInclude(items, item) {
      for (let i of items) {
        if (
          item["left"] == i["left"] &&
          item["right"] == i["right"] &&
          item["dot"] == i["dot"]
        )
          return true;
      }
      return false;
    },
    genItemFamily() {
      //生成项目集规范族
      for (let i = 0; i < this.itemfamily.length; i++) {
        let front = [];
        for (let item of this.itemfamily[i]) //活前缀,每句话点"·"后的第一个符号
          front.push(item["right"][item["dot"]]);
        this.goMap[i] = [];
        for (let sign of front) {
          //生成新的规范族
          let newItem = this.go(i, sign);
          if (newItem == null) continue;
          let same = this.itemfamilyEqual(newItem);
          if (same == -1) {
            // 如果不存在相同的规范族
            this.itemfamily.push(newItem);
            this.goMap[i][this.itemfamily.length - 1] = sign;
          } else {
            // 已存在相同的规范族
            this.goMap[i][same] = sign;
          }
        }
      }
    },
    go(index, sign) {
      if (typeof sign == "undefined") return null;
      let items = this.itemfamily[index];
      let from = []; // 满足go函数的项目集合
      for (let item of items) {
        if (item["right"][item["dot"]] == sign)
          from.push({
            left: item["left"],
            right: item["right"],
            dot: item["dot"] + 1,
          });
      }
      return this.closure(from);
    },
    itemfamilyEqual(item1) {
      //规范族去重
      for (let j = 0; j < this.itemfamily.length; j++) {
        let flag = true;
        if (this.itemfamily[j].length != item1.length) continue;
        for (let i = 0; i < item1.length; i++)
          if (!this.itemsInclude(this.itemfamily[j], item1[i])) flag = false;
        if (flag == true) return j;
      }

      return -1;
    },
    showDFA() {
      // 定义规范族
      for (let i = 0; i < this.itemfamily.length; i++) {
        let nodeText = [];
        for (let item of this.itemfamily[i]) {
          nodeText.push(this.itemSetToString(item));
          // console.log(nodeText);
        }
        this.graph.push({
          id: i,
          text: '"s' + i + "</br>" + nodeText.join("</br>") + '"',
          next: [],
          link: [],
        });
      }
      console.log("初始化 图：", this.graph);

      // 定义规范族之间的关系
      for (let i = 0; i < this.goMap.length; i++)
        for (let j = 0; j < this.goMap[i].length; j++)
          if (this.goMap[i][j] != null) {
            this.graph[i]["next"].push("" + j);
            this.graph[i]["link"].push('-- "' + this.goMap[i][j] + '" -->');
          }

      console.log("完成 图：", this.graph);
    },
    itemSetToString(item) {
      let dd = JSON.parse(JSON.stringify(item["right"]));
      // console.log(dd);
      dd.splice(item["dot"], 0, ".");
      return item["left"] + " -> " + dd.join(" ");
    },
    genACTIONGOTO() {
      // 生成ACTION、GOTO
      // console.log("this.itemfamily:", this.itemfamily);
      // console.log("this.GrammarStream:", this.GrammarStream);
      for (let index in this.itemfamily) {
        this.ACTION[index] = {};
        this.GOTO[index] = {};
        for (let item of this.itemfamily[index]) {
          if (item["dot"] == item["right"].length) {
            // 点移动到最后一位，可以进行规约
            if (item["left"] == "S'") {
              // S'遇到结束符#，acc
              this.ACTION[index]["#"] = "acc";
              continue;
            }
            for (let f of this.follow[item["left"]]) {
              // 找到用来归约的产生式，使用rx进行规约
              let toIndex = this.findgrammar(item["left"], item["right"]);
              this.ACTION[index][f] = "r" + toIndex;
            }
          } else if (!this.unTerminalSymbols.has(item["right"][item["dot"]])) {
            // 遇到非终结符，进行ACTION
            for (let toIndex in this.goMap[index])
              if (this.goMap[index][toIndex] == item["right"][item["dot"]])
                this.ACTION[index][item["right"][item["dot"]]] = "s" + toIndex;
          } else if (this.unTerminalSymbols.has(item["right"][item["dot"]])) {
            // 遇到终结符，伴随移入，GOTO
            for (let toIndex in this.goMap[index])
              if (this.goMap[index][toIndex] == item["right"][item["dot"]])
                this.GOTO[index][item["right"][item["dot"]]] = toIndex;
          }
        }
      }
      console.log("ACTION:", this.ACTION);
      console.log("GOTO", this.GOTO);
    },
    findgrammar(key, value) {
      for (let i in this.GrammarStream)
        if (
          this.GrammarStream[i]["left"] == key &&
          this.GrammarStream[i]["right"] == value
        )
          return i;
    },
    showSLRSheet() {
      for (let s of this.TerminalSymbols) this.SLRtableCol1.push(s);
      this.SLRtableCol1.push("#");
      for (let s of this.unTerminalSymbols) this.SLRtableCol2.push(s);

      for (let i = 0; i < this.itemfamily.length; i++) {
        let SLRline = { num: "s" + i };

        for (let a in this.ACTION[i]) SLRline[a] = this.ACTION[i][a];

        for (let g in this.GOTO[i]) SLRline[g] = this.GOTO[i][g];

        this.SLRtableData.push(SLRline);
      }
    },
    GrammarFunctionReturner() {
      // console.log("归约规则集合", this.GrammarFunction);l
      for (let g of this.GrammarFunction) {
        console.log(g["FuncStr"]);
        let f = new Function("return " + g["FuncStr"]);
        g["f"] = f();
        // g["f"](g["str"]);
      }
      console.log("Build tree:" + this.buildTree());
    },
    buildTree() {
      let stateStack = [0];
      let SymStack = [{ type: "$" }];
      let tmp = this.LexStream.shift();
      let Next = { type: tmp["type"], attribute: tmp["attribute"] };
      this.errorText +=
        tmp["attribute"] == "_" ? tmp["type"] + " " : tmp["attribute"] + " ";
      let flag = true;
      while (flag) {
        flag = false;
        this.updateProcess(stateStack, SymStack, Next);
        console.log("输入栈：", this.LexStream);
        console.log("符号栈：", SymStack);
        console.log("状态栈：", stateStack);
        console.log("Next：", Next);
        if (stateStack.length == SymStack.length) {
          let action = this.ACTION[stateStack.slice(-1)[0]][Next["type"]];
          console.log("action:", action);
          if (action == undefined) {
            let expect = "";
            for (let e in this.ACTION[stateStack.slice(-1)[0]])
              expect += e + " ";
            this.$alert(
              "<i>" +
                this.errorText.slice(0, -2) +
                ' </i><font color="red">^' +
                this.errorText.slice(-2) +
                '</font><br><strong>Next character unexpected</strong><br>Expect: <font color="green">' +
                expect +
                "</font>",
              "编译错误",
              {
                confirmButtonText: "确定",
                dangerouslyUseHTMLString: true,
              }
            );
          } else if (action == "acc") {
            this.tableProcess[this.tableProcess.length - 1]["act"] = "acc";
            console.log("Build tree success:");
            console.log(SymStack.slice(-1)[0]);
            this.Result = SymStack.slice(-1)[0]["code"];
            this.showTree(SymStack.slice(-1)[0], 0);
            ElMessage.success({
              message: "生成三地址码成功",
              type: "success",
            });
            return true;
          } else if (action[0] == "s") {
            this.tableProcess[this.tableProcess.length - 1]["act"] =
              "ACTION(" +
              stateStack.slice(-1)[0] +
              "," +
              Next["type"] +
              ")=" +
              action +
              "，状态" +
              action.slice(1) +
              "入栈";
            stateStack.push(parseInt(action.slice(1)));
            SymStack.push(Next);
            tmp = this.LexStream.shift();
            Next = { type: tmp["type"], attribute: tmp["attribute"] };
            this.errorText +=
              tmp["attribute"] == "_"
                ? tmp["type"] + " "
                : tmp["attribute"] + " ";
            flag = true;
          } else if (action[0] == "r") {
            let gramNum = parseInt(action.slice(1));
            this.tableProcess[this.tableProcess.length - 1]["act"] =
              action +
              "：用" +
              (this.GrammarStream[gramNum]["left"] +
                "->" +
                this.GrammarStream[gramNum]["right"]) +
              "归约";
            let para_arr = [];
            for (
              let i = 0;
              i < this.GrammarStream[gramNum]["right"].length;
              i++
            ) {
              para_arr.unshift(SymStack.pop());
              stateStack.pop();
            }
            console.log("para_arr:", para_arr);
            SymStack.push(this.GrammarFunction[gramNum]["f"](para_arr, this));
            flag = true;
          } else {
            ElMessage.error("ACTION表内符号错误");
          }
        } else if (stateStack.length < SymStack.length) {
          this.tableProcess[this.tableProcess.length - 1]["act"] =
            "GOTO(" +
            stateStack.slice(-1)[0] +
            "," +
            SymStack.slice(-1)[0]["type"] +
            ")状态" +
            this.GOTO[stateStack.slice(-1)[0]][SymStack.slice(-1)[0]["type"]] +
            "入栈";
          console.log(
            "goto:",
            this.GOTO[stateStack.slice(-1)[0]][SymStack.slice(-1)[0]["type"]]
          );
          stateStack.push(
            parseInt(
              this.GOTO[stateStack.slice(-1)[0]][SymStack.slice(-1)[0]["type"]]
            )
          );
          flag = true;
        } else {
          ElMessage.error("符号栈/状态栈状态异常");
        }
      }
      return false;
    },
    updateProcess(stateStack, SymStack, Next) {
      let state = "";
      for (let num of stateStack) state += num + " ";

      let sym = "";
      for (let s of SymStack) sym += s["type"] + " ";

      let next = Next["type"];

      this.tableProcess.push({
        idx: ++this.stepProcess,
        state: state,
        sym: sym,
        next: next,
        act: "act",
      });
    },
    showTree(node, i) {
      console.log("tree:", node);
      let content = [];
      let tab = "";
      for (let idx = 0; idx < i; idx++) tab += "    ";
      for (let s in node) {
        if (s != "children" && s != "code") {
          if (s == "type") content.push(tab + s + ": " + node[s]);
          else content.push(s + ": " + node[s]);
        }
      }
      this.treeText += content.join(" ") + "\n";
      if ("children" in node)
        for (let child of node["children"]) {
          this.showTree(child, i + 1);
        }
    },
  },
};
</script>
