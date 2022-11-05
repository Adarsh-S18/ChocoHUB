var express = require('express');
const { helpers } = require('handlebars');
const { ObjectId } = require('mongodb');
var productHelpers = require('../helpers/product-helpers');
const { getchartData } = require('../helpers/user-helpers');
const userHelpers = require('../helpers/user-helpers');

var router = express.Router();
/* GET users listing. */

const credential = {
  email: "adarshspillai@gmail.com",
  password: "adarsh"

}

//     L O G I N   // 



router.get('/admin-login', function (req, res) 
{
  if (req.session.admin)
   {
    res.redirect('/admin/')
  }
  else {
    res.render('admin/admin-login')
  }
})
router.post('/admin-login', (req, res) => {
  if (req.body.email == credential.email && req.body.password == credential.password) {
    res.redirect('/admin/')
  }
  else {
    res.redirect('/admin/admin-login')
  }
})



router.get('/', async(req, res)=>
{
  let count=await productHelpers.getUserCount()
  let product=await productHelpers.getProductCount()
  let order=await productHelpers.getOrderCount()
  res.render('admin/sidebar-dashboard', { admin: true ,count , product , order})

} );






/////////////////////////////////////////////
//         D A S H B O A R D               //
/////////////////////////////////////////////

router.get('/sidebar-dashboard',async(req,res)=>
{
  let count=await productHelpers.getUserCount()
  let product=await productHelpers.getProductCount()
  let order=await productHelpers.getOrderCount()
  res.render('admin/sidebar-dashboard',{admin:true,count,product,order})

})


///////////////////////////////////////////////
//      S I D E B A R   P R O D U C T S     //
//////////////////////////////////////////////


router.get('/sidebar-products', function (req, res, next) {
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/sidebar-products', {products, admin: true })
  })
})



// router.get('/user-login', function (req, res) {
//   if (req.session.user) 
//   {
//     res.redirect('/')
//   }
//   else {
//     res.render('user/user-login', { "loginErr": req.session.userloginErr });
//     req.session.userloginErr = false;
//   }
// });



/////////////////////////////////////////////////
//           A D D  P R O D U C T S           //
////////////////////////////////////////////////




router.get('/add-products', async(req, res) =>{
  let category=await productHelpers.getAllCategory()
  res.render('admin/add-products',{admin:true,category})
})


router.post('/add-products',async(req, res) =>
{
  console.log(req.body);
  req.body.category = ObjectId(req.body.category)
  productHelpers.addProduct(req.body, (id) => 
  {
    let image = req.files.image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => 
    {
      if (!err) 
      {
        res.redirect('/admin/sidebar-products')
      }
    })
    res.render('admin/add-products')
  })
})




////////////////////////////////////////////
//      B L O C K  & U N B L O C K       //
///////////////////////////////////////////


router.get('/block-user/:id/:blockStatus', (req, res) => {
  let userId = req.params.id;
  let userstatus = req.params.blockStatus;
  let status=true;
  if (userstatus=="true") 
  {
    status = false;
  }
  productHelpers.blockUser(userId, status).then((response) => {
    res.redirect('/admin/sidebar-users')
  })
})



  //////////////////////////////////////////
 //    S I D E B A R   C A T E G O R Y   //
//////////////////////////////////////////




router.get('/sidebar-category', (req, res) => {
  productHelpers.getAllCategory().then((category) => {
    res.render('admin/sidebar-category', { category, admin: true })
  })
})
 



router.get('/sidebar-users', (req, res) => {
  userHelpers.getAllUser().then((users) => {
    res.render('admin/sidebar-users', { users, admin: true })
  })
})



router.get('/add-category', (req, res) => {
  res.render('admin/add-category', { admin: true })
})



router.post('/add-category', (req, res) => {

  productHelpers.addCategory(req.body).then((result) => {
    res.redirect('/admin/sidebar-category')
  })
})


router.get('/delete-products/:id', (req, res) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/sidebar-products')
  })
})

router.get('/edit-products/:id', async (req, res) => {
  let category=await productHelpers.getAllCategory()
  let product = await productHelpers.getProductDetails(req.params.id)
  product = product[0]
  res.render('admin/edit-products', {product,admin:true,category})
})




router.get('/delete-category/:id', (req, res) => {
  let proId = req.params.id
  productHelpers.deleteCategory(proId).then((response) => {
    res.redirect('/admin/sidebar-category')
  })
})




router.get('/edit-category/:id', async (req, res) => {
  let category = await productHelpers.getCategoryDetails(req.params.id)
  category = category[0]
  res.render('admin/edit-category', { category, admin: true })
})



router.post('/edit-category/:id', (req, res) => {
  let id = req.params.id
  productHelpers.updateCategory(req.params.id, req.body).then(() => {
    res.redirect('/admin/sidebar-category')
  })
})

router.get('/add-offer/:id',(req,res)=>
{
  let catId=req.params.id
  res.render('admin/addCategoryoffers',{catId,admin:true})
})

router.post('/add-offer/:id',(req,res)=>
{
  let catId=req.params.id
  let off=req.body.off
  let validTill=req.body.offTill
  productHelpers.addCategoryOff(catId,off,validTill).then(()=>
  {
    res.redirect('/admin/sidebar-category')
  })
})



router.post('/edit-products/:id', (req, res) => {
  console.log(req.params.id)
  let id = req.params.id
  req.body.category = ObjectId(req.body.category)
  productHelpers.updateProduct(req.params.id, req.body).then(() => 
  {
    res.redirect('/admin/sidebar-products')
    if (req.files) {
      let image = req.files.image
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
}
)


/////////////////////////////////////////
//            O R D E R S              //
/////////////////////////////////////////


router.get('/sidebar-orders',function(req,res,next)
{
  userHelpers.getAllOrders().then((orders)=>
  {
    res.render('admin/sidebar-orders',{orders,admin:true})
  })
})


router.get('/delete-order/:id',(req,res)=>
{
  let userId=req.params.id;
  userHelpers.deleteOrders(userId).then((response)=>
  {
    res.redirect('/admin/sidebar-orders')
  })
})













router.post('/change-orderstatus',(req,res)=>
{
  console.log(req.body);
  userHelpers.updateOrderStatus(req.body).then((response)=>
  {
    res.status(200).json(response)
  })
})









router.get('/order-products/:id',async(req,res)=>
{
  let product= await userHelpers.orderedProducts(req.params.id)
  res.render('admin/order-products',{product,admin:true})
})






//////////////////////////////////////////////
//       S I D E B A R   C  O U P O N S     //
//////////////////////////////////////////////

router.get('/sidebar-coupons',(req,res)=>
{
  productHelpers.getAllCoupons().then((coupons)=>
  {
    res.render('admin/sidebar-coupons',{admin:true,coupons})
  })
  
})


router.get('/add-coupons',(req,res)=>
{  
  res.render('admin/add-coupons',{admin:true})
})

router.post('/add-coupons',(req,res)=>
{
  productHelpers.addCoupons(req.body).then((result)=>
  {
    res.redirect('/admin/sidebar-coupons')
  })
})

router.get('/delete-coupons/:id',(req,res)=>
{
  let couponId=req.params.id
  productHelpers.deleteCoupons(couponId).then((response)=>
  {
    res.redirect('/admin/sidebar-coupons')
  })
})


router.get('/edit-coupons/:id' ,async (req,res)=>
{
  let coupon=await productHelpers.getCouponDetails(req.params.id)
  coupon=coupon[0]
  res.render('admin/edit-coupons',{ coupon , admin:true})
})

router.post('/edit-coupons/:id',(req,res)=>
{
  productHelpers.updateCoupons(req.params.id,req.body).then(()=>
  {
    res.redirect('/admin/sidebar-coupons')
  })
})






router.get('/getChartData',getchartData)



router.get('/admin-logout', (req, res) => 
{
  // req.session.user = null
  req.session.destroy()
  res.redirect('/admin/admin-login')
})

module.exports = router;
