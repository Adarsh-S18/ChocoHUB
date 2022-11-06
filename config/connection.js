const mongoClient=require('mongodb').MongoClient
const state={db:null}
require('dotenv').config

module.exports.connect=function(done)
{
    const url=`mongodb+srv://adarsh18:${process.env.PASSWORD}@cluster0.w3h1ja9.mongodb.net/?retryWrites=true&w=majority`
    const dbname='hub'
    mongoClient.connect(url,(err,data)=>{
        if(err)
        return done(err)
        state.db=data.db(dbname)
        done()
    })
    
}
module.exports.get=function(){
    return state.db
}