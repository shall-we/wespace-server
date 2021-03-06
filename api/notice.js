const Notice = require("../models").notice;
const Sequelize = require('sequelize');
exports.create = async (req, res, next) => {

  //if has token, check valid token
  if(req.user){
    if(req.user._id !== req.body.from){
        res.send({result : "fail", failType : "notValidateToken"});
        return;
    }
}
const query_tmp = 'INSERT INTO NOTICE  SELECT null, :type, :from, a.user_id, :object,:message, now(),"FALSE" FROM folder_list a WHERE folder_id=';
const query_folder=':object';
const query_note='(select folder_id from note where id=:object)';
let query;

if(req.body.option==='MULTI'){
    if(req.body.type==='FOLDER')
    query='INSERT INTO NOTICE  SELECT null, :type, :from, a.user_id, :object,:message, now(),"FALSE" FROM folder_list a WHERE folder_id=:object';
    else if(req.body.type==='NOTE')
    query='INSERT INTO NOTICE  SELECT null, :type, :from, a.user_id, :object,:message, now(),"FALSE" FROM folder_list a WHERE folder_id=(select folder_id from note where id=:object)';
    else if(req.body.type==='COMMENT')
    query='INSERT INTO NOTICE  SELECT null, :type, :from, a.user_id, :object,:message, now(),"FALSE" FROM folder_list a WHERE folder_id=(select folder_id from note where id=:object)';
}else if(req.body.option==='SINGLE')
{
  query='INSERT INTO NOTICE values(null, :type, :from, :to, :object,:message, now(),"FALSE")';
}
console.log('query:::',query);
var values = {
    type: req.body.type,
    from: req.body.from,
    object: req.body.object,
    message: req.body.message,
    to: req.body.to
};

    Notice.sequelize.query(query, {replacements: values})
    .spread(function (results, metadata) {
       
        res.send({
            result: "success",
            data: results
        });
      }, function (err) {
  
  
      });
};

        exports.getNoticeList = async (req, res, next) => {

            if(req.query.type==='FOLDER')
            query='select c.name as "from",d.name as "object", a.message, date_format(a.reg_date,"%y-%m-%d %T")as reg_date from NOTICE a,USER c,FOLDER d where  a.from=c.id and a.object=d.id and  a.to=:id and a.type=:type order by a.reg_date';
            else if(req.query.type==='COMMENT')
            query='select a.from as from_id,b.name as "from" , c.name as object , a.message, date_format(a.reg_date,"%T") as reg_date ,  COUNT(IF (a.check ="FALSE", 1, null)) as "check" ,a.type from NOTICE a,USER b ,NOTE c where  a.from=b.id and a.object=c.id and  a.object=:id and (a.type=:type or (a.type="CHAT" and a.to=:user_id))  group by a.from, b.name , c.name , a.message, a.reg_date,a.type order by a.reg_date';
            else  if(req.query.type==='NOTE')
            query='select d.name as "object",c.name as "from", a.message, date_format(a.reg_date,"%y-%m-%d %T") as reg_date  from NOTICE a ,USER c,NOTE d where a.from=c.id and a.object=d.id and a.check="FALSE" and  a.to=:id and a.type=:type order by a.reg_date';
            else  if(req.query.type==='CHAT')
            query='select d.name as "object",c.name as "from", a.message, date_format(a.reg_date,"%y-%m-%d %T") as reg_date  from NOTICE a ,USER c,NOTE d where a.from=c.id and a.object=d.id and a.check="FALSE" and  a.to=:id and a.type=:type order by a.reg_date desc';

            var values = {
              id: parseInt(req.query.id),
              type: req.query.type,
              user_id:parseInt(req.query.user_id),
            };
            Notice.sequelize.query(query, {replacements: values})
            .spread(function (results, metadata) {
               
                res.send({
                    result: req.query.type,
                    data: results
                });
              }, function (err) {
          
          
              });
        };

        exports.updateNoticeList = async (req, res, next) => {

          //if has token, check valid token
          if(req.user){
            if(req.user._id !== parseInt(req.params.to)){
                res.send({result : "fail", failType : "notValidateToken"});
                return;
              }
          }
          Notice.update({check:'TRUE'},{where: {to: req.params.to,object:req.params.object,type:req.params.type}, returning: true})
              .then(function(result) {res.json(result[1][0]);})
              .catch(function(err) {console.log("데이터 수정 실패");});
      };



