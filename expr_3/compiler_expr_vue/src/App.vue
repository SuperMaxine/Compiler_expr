<template>
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
  <HelloWorld :graph="graph" />
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
  },
  data() {
    return {
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
      graph: [
        {
          id: "1",
          text: "A",
          link: ["-- yes -->", "-- no -->"],
          next: ["2", "3"],
        },
        { id: "2", text: "B", next: ["3"] },
        { id: "3", text: "C", next: ["4", "6"] },
        {
          id: "4",
          text: "D",
          link: ["-- This is fuck text ---","-- fuck -->"],
          next: ["5","6"],
        },
        { id: "5", text: "E" },
        { id: "6", text: "F" },
      ],
    };
  },
  methods: {
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
          this.LexResult += "INT 16\t" + num + "\n";
          this.LexStream.push({ type: "INT 16", attribute: num });
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
          this.LexResult += "INT 8\t" + num + "\n";
          this.LexStream.push({ type: "INT 8", attribute: num });
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
          this.LexResult += "INT 10\t" + rs[0] + "\n";
          this.LexStream.push({ type: "INT 10", attribute: rs[0] });
        } else if (rs[6]) {
          // 运算符和分隔符
          // console.log(rs[0],"\t _");
          this.LexResult += rs[0] + "\t _" + "\n";
          this.LexStream.push({ type: rs[0], attribute: "_" });
        }
      }

      // console.log(this.LexStream);
    },
    init_grammar_parser() {
      // 初始化
      this.graph = [];
      this.GrammarStream = [];
      this.TerminalSymbols= new Set(); // 终结符
      this.unTerminalSymbols= new Set(); // 非终结符
      this.GrammarStream= [];
      this.first= {}; // FIRST集
      this.follow= {}; // FOLLOW集合
      this.itemSet= []; // 项目集
      this.itemfamily= []; // 项目规范族
      this.goMap= []; // Go函数
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
        right: this.GrammarStream[0]["left"],
        dot: 0,
      });
      console.log("结构化文法", this.GrammarStream);

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
      for (let i = 0; i < this.GrammarStream.length; i++) {
        for (let j = 0; j < this.GrammarStream[i]["right"].length; j++) {
          this.itemSet.push({
            left: this.GrammarStream[i]["left"],
            right: this.GrammarStream[i]["right"],
            dot: j,
          });
        }
      }
      console.log("项目集：", this.itemSet);

      // 生成项目规范族
      this.itemfamily.push(this.closure([this.itemSet[0]]));
      console.log("初始项目规范族：", this.itemfamily);
      this.genItemFamily();
      console.log("项目规范族：", this.itemfamily);
      console.log("goMap:", this.goMap);
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
        for (let g of this.GrammarStream) {
          let pos = 0; // 找到非终结符
          let ppos = 0; // 找到非终结符后的其他终结符
          while (pos < g["right"].length) {
            if (this.unTerminalSymbols.has(g["right"][pos])) {
              ppos = pos + 1;
              if (ppos == g["right"].length) {
                for (let f of this.follow[g["left"]])
                  if (!this.follow[g["right"][pos]].includes(f)) {
                    this.follow[g["right"][pos]].push(f);
                    flag = true;
                  }
                break;
              }
              while (ppos < g["right"].length) {
                if (this.unTerminalSymbols.has(g["right"][ppos])) {
                  for (let f of this.first[g["right"][ppos]]) {
                    if (!this.follow[g["right"][pos]].includes(f) && f != "e") {
                      this.follow[g["right"][pos]].push(f);
                      flag = true;
                    }
                  }
                  if (this.first[g["right"][ppos]].includes("e")) ppos += 1;
                  else {
                    pos += 1;
                    break;
                  }
                } else {
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
        for (let item of this.itemfamily[i]) //活前缀
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
  },
};
</script>
