# BackEnd

## Setup steps
### Server
* npm i
* npm install express mysql body-parser ejs dotenv axios cookie-session express-session bcrypt js-sha256
* npm start

### Database
* sudo /usr/local/mysql/bin/mysql -uroot -p
* mysql> source /...directory to sql file.../project4481-2_0.sql

To view the tables, run `show tables;`
![image](https://user-images.githubusercontent.com/26203082/155049861-de42ba4f-7b29-4b14-bcd0-1036f104ca48.png)


If you get access errors, stop mysql and run the following commands:
* ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
* flush privileges;
