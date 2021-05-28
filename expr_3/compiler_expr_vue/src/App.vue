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

  <el-row
    ><el-input
      type="textarea"
      :autosize="{ minRows: 1 }"
      placeholder="请输入终结符,以\分割,不要包含空格"
      v-model="RawTerminalSymbols"
    >
    </el-input>
  </el-row>

  <br />

  <el-row :gutter="20">
    <el-col :span="22"
      ><el-input
        type="textarea"
        :autosize="{ minRows: 5 }"
        placeholder="请输入语法"
        v-model="RawGrammar"
      >
      </el-input
    ></el-col>
    <el-col :span="2"
      ><el-button type="primary" v-on:click="grammar_parser"
        >语法分析</el-button
      ></el-col
    >
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
      TerminalSymbols: [],
      RawGrammar: "",
      GrammarStream: [],
      DFA:[],
      graph: [
        {
          id: "1",
          text: "A",
          next: ["2"],
        },
        { id: "2", text: "B", next: ["3"] },
        { id: "3", text: "C", next: ["4", "6"] },
        {
          id: "4",
          text: "D",
          link: "-- This is fuck text ---",
          next: ["5"],
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
    grammar_parser() {
      this.graph = [];
      this.TerminalSymbols = this.RawTerminalSymbols.split("\\");
      this.GrammarStream = [];
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
      });
      console.log(this.GrammarStream);
      // TODO 给GrammarStream中每个表达式右侧的最左都加一个点

      // 进入buildDFA循环
      this.buildDFA();
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
      // let right = gen[1].split("\\");
      // console.log(right);
      return { left: gen[0], right: gen[1].split("\\") };
    },
    buildDFA(){
      
    }
  },
};
</script>
