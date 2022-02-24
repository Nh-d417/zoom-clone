import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

//미들웨어 : 모든 요청들이 use를 지나감 : 
//express.static : 특정 파일에 링크된 텍스트 파일을 읽을때 사용 (모든 파일의 소스는 public에서 )
app.use("/public", express.static(__dirname + "/public"));

// get요청 : 위 설정한 /views/.pug파일을 디폴트 홈으로 요청하여 화면 표시함
app.get("/", (req, res) => res.render("home"));

//홈의 뒤에 어느 문자를 입력해도 홈으로 돌아오도록 함
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

app.listen(3000, handleListen);