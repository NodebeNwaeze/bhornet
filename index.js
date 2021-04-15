const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: 'DkmdTXc3ZCIxvHAasRIvzDBmWZT4gIpBJGT1a4hbPquYAtwIFxvzwVHp6YRlBe7y',
  APISECRET: '5sAojc4CqzjnuZKIR0BuvPkcMcRlfM1RJoe7emszHr1Sz8bIyV9QssFpFa0Dn5QV'
});

  var static_vars = {
    spendAmount:70,
    leverage:10,
    opendorder:false,
    expectedbnbusdt:0,
    expectedSpot_bnb_usdt:0,
    futures_orderID:"",
    purchase_spot_quantity:0,
    pair:"BNBUSDT",
    pair_step: 0.01,
    onceFlag: false
  }

  var start = async function(){
    try{
      if(!static_vars.onceFlag){

        if(static_vars.opendorder){

          var futureprices = await binance.futuresPrices();
          var bnbusdt = futureprices.BNBUSDT;
          // var spot_prices = await binance.prices(static_vars.pair);
          // var spot_bnb_usdt = spot_prices.BNBUSDT; 
    
          var prev_order = await binance.futuresOrderStatus( static_vars.pair, {orderId: static_vars.futures_orderID} ) 
          
          if(bnbusdt >= static_vars.expectedbnbusdt){
            closebnbusdtOrder();
          }else if(prev_order.status !== "FILLED"){
            closespot_bnb_usdtOrder();
          }
          
        }else{
          check_a_p_order();
        }

      }else{
        closebnbusdtOrder();
      }
    }catch(e){
      console.log("------------------Erro: "); console.log(e); console.log("------------------ previous futures order status Erro END");
    }
  }
  
  var check_a_p_order = async function(){
  try{
   var futureprices = await binance.futuresPrices();
   var bnbusdt = futureprices.BNBUSDT;
   var spot_prices = await binance.prices(static_vars.pair);
   var spot_bnb_usdt = spot_prices.BNBUSDT; 
   
   console.log(bnbusdt+" | "+spot_bnb_usdt);

    if((bnbusdt - spot_bnb_usdt) >= 1 || (spot_bnb_usdt - bnbusdt) >= 1){
      placeOrders(bnbusdt,spot_bnb_usdt);
    }

   }catch(e){
   console.log(e+" ----- erro geting BNBUSDT futures price or BNB/USDT spot price");
    }
    };

  var placeOrders = async function(bnbusdt,spot_bnb_usdt){
    try{
    var f_stake_amount = static_vars.spendAmount / static_vars.leverage;
    var final_f_stake_amount = Number( (f_stake_amount/bnbusdt).toPrecision(1) );
    var spot_stake_amount = Number( (static_vars.spendAmount/spot_bnb_usdt).toPrecision(1) );

    if (final_f_stake_amount >= static_vars.pair_step){
      // var spot_order = await binance.marketBuy(static_vars.pair, spot_stake_amount);
      static_vars.purchase_spot_quantity = spot_stake_amount;
      var futures_order = await binance.futuresMarketSell( static_vars.pair, final_f_stake_amount);
      static_vars.futures_orderID = futures_order.orderId;
      static_vars.opendorder = true;
      console.info( final_f_stake_amount );
      console.info(futures_order);
      // console.log(spot_order);
      static_vars.onceFlag = true;
    }
    
  }catch(e){
    console.log("------------------Erro: "); console.log(e); console.log("------------------order placement Erro END");
  }
  }

  var closespot_bnb_usdtOrder = async function(){
    try{
    console.log("Closing spot order \n-----------------------------------------------------------");
    console.info( await binance.marketSell(static_vars.pair, static_vars.purchase_spot_quantity));
    console.log("\n spot order closed successfully-------------------------------------------------------------------");
    static_vars.opendorder = false;
  }catch(e){
    console.log("------------------Erro:"); console.log(e); console.log("------------------spot order Erro END");
  }
  }

  var closebnbusdtOrder = async function(){
    try{
    console.log("Closing futures order \n-----------------------------------------------------------");
    console.log(static_vars.futures_orderID);
    console.info( await binance.futuresCancelAll(static_vars.pair));
    console.log("\n futures order closed successfully-------------------------------------------------------------------");
    static_vars.opendorder = false;
  }catch(e){
    console.log("------------------Erro:"); console.log(e); console.log("------------------futures order Erro END");
  }
  }

  var acc_setup = async function(){
    try{
    var levrageAdjust = await binance.futuresLeverage( static_vars.pair, static_vars.leverage );
  }catch(e){
    console.log("------------------Erro: "); console.log(e); console.log("------------------acc setup Erro END");
  }
  }

    acc_setup();
   setInterval(start, 8000);