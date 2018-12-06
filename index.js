const PORT = 3484;									//Đặt địa chỉ Port được mở ra để tạo ra chương trình mạng Socket Server
 
var http = require('http') 							//#include thư viện http - Tìm thêm về từ khóa http nodejs trên google nếu bạn muốn tìm hiểu thêm. Nhưng theo kinh nghiệm của mình, Javascript trong môi trường NodeJS cực kỳ rộng lớn, khi bạn bí thì nên tìm hiểu không nên ngồi đọc và cố gắng học thuộc hết cái reference (Tài liêu tham khảo) của nodejs làm gì. Vỡ não đó!
var socketio = require('socket.io')				//#include thư viện socketio
var url = 'mongodb://Optimusprime242:optimusprime242@ds217898.mlab.com:17898/smartlock';


var ip = require('ip');
var app = http.createServer();					//#Khởi tạo một chương trình mạng (app)
var io = socketio(app);								//#Phải khởi tạo io sau khi tạo app!
app.listen(process.env.PORT || PORT);										// Cho socket server (chương trình mạng) lắng nghe ở port 3484
console.log("Server nodejs chay tai dia chi: " + ip.address() + ":" + PORT)

var MongoClient = require('mongodb').MongoClient;

//giải nén chuỗi JSON thành các OBJECT
function ParseJson(jsondata) {
    try {
        return JSON.parse(jsondata);
    } catch (error) {
        return null;
    }
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}

//Khi có mệt kết nối được tạo giữa Socket Client và Socket Server
io.on('connection', function(socket) {	//'connection' (1) này khác gì với 'connection' (2)
	//hàm console.log giống như hàm Serial.println trên Arduino
    console.log("Connected"); //In ra màn hình console là đã có một Socket Client kết nối thành công.
	
	//Gửi đi lệnh 'welcome' với một tham số là một biến JSON. Trong biến JSON này có một tham số và tham số đó tên là message. Kiểu dữ liệu của tham số là một chuối.
    socket.emit('welcome', {message: 'Connected !!!!'});
	
	//Khi lắng nghe được lệnh "connection" với một tham số, và chúng ta đặt tên tham số là message. Mình thích gì thì mình đặt thôi.
	//'connection' (2)
    socket.on('connection', function(message) {
        console.log(message);
    });
	
	//khi lắng nghe được lệnh "atime" với một tham số, và chúng ta đặt tên tham số đó là data. Mình thích thì mình đặt thôi
    socket.on('savedb', function(order) {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err,database)
        {
            const dbase = database.db('smartlock');
            if(err) {
                console.log('Unable to connect to database server. Error: ', err);
            } else {
                console.log('Connected to database server', url);
                var datetime = getDateTime();
                var data = {who : order.user, action : order.request, device : order.device, time : datetime};
                var collection = dbase.collection('lock');
                collection.insertOne(data, function(err, result)
                    {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log('Inserted %d documents into "lock" collection', result.length);
                        }
                        database.close();
                    }); 
            }
        });
    });
	
});