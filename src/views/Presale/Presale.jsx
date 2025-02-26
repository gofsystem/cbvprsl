import { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from 'moment';
import { changeApproval, changeDeposit } from "../../slices/PresaleThunk";
import { addresses } from "../../constants";
import { useWeb3Context } from "src/hooks/web3Context";
import { isPendingTxn, txnButtonText } from "src/slices/PendingTxnsSlice";
import {
  Paper,
  Grid,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  SvgIcon,
  Link,
  useMediaQuery,
} from "@material-ui/core";
import "./style.scss";
import Progress from 'react-progressbar';
import contractImg from "src/assets/icons/pngegg.png";
import logoImg from "src/assets/icons/logo.png";
import ProgressCountdown from './ProgressCountdown';
import { shorten } from "../../helpers";
import { error } from "../../slices/MessagesSlice";
import { ethers, BigNumber } from "ethers";

function Presale() {
  const dispatch = useDispatch();
  const smallerScreen = useMediaQuery("(max-width: 594px)");
  const { provider, address, connected, connect, chainID } = useWeb3Context();
  const networkID = chainID;
  const ANT_ADDRESS = addresses[networkID].HEC_ADDRESS;
  const PRESALE_ADDRESS = addresses[networkID].PRESALE_ADDRESS;
  const [quantity, setQuantity] = useState("");

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });
  const bnbBalance = useSelector(state => {
    return state.account.balances && state.account.balances.bnb;
  });
  const ANTBalance = useSelector(state => {
    return state.account.balances && state.account.balances.ohm;
  });
  const price = useSelector(state => {
    return state.app.price;
  });
  const capable = useSelector(state => {
    return state.account.presale && state.account.presale.capable;
  });
  const starttime = useSelector(state => {
    return state.app.starttime;
  });
  const endtime = useSelector(state => {
    return state.app.endtime;
  });
  const minEthlimit = useSelector(state => {
    return state.app.minEthlimit;
  });
  const maxEthlimit = useSelector(state => {
    return state.app.maxEthlimit;
  });
  const hardCap = useSelector(state => {
    return state.app.hardCap;
  });
  const totalRaisedBNB = useSelector(state => {
    return state.app.totalRaisedBNB;
  });
  const soldAmount = useSelector(state => {
    return state.app.soldAmount;
  });
  const userInfo = useSelector(state => {
    return state.account.presale && state.account.presale.userInfo;
  });

  const setMax = () => {
    if(bnbBalance > capable) {
      setQuantity(capable);
    } else {
      setQuantity(bnbBalance);
    }
  };

  const onChangeDeposit = async action => {
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(quantity) || quantity === 0 || quantity === "") {
      // eslint-disable-next-line no-alert
      return dispatch(error("Please enter a value!"));
    }

    // 1st catch if quantity > balance
    let gweiValue = ethers.utils.parseUnits(quantity, "ether");

    if (action === "presale" && gweiValue.gt(ethers.utils.parseUnits(bnbBalance, "ether"))) {
      return dispatch(error("You cannot deposit more than your BNB balance."));
    }
    await dispatch(changeDeposit({ address, action, value: quantity.toString(), provider, networkID: chainID }));
  };

  const started = starttime ? Date.now() >= starttime.getTime() : false;
  const ended = endtime ? Date.now() >= endtime.getTime() : false;

  const isAllowanceDataLoading = hardCap == undefined;
  // let modalButton = [];

  // modalButton.push(
  //   <Button variant="contained" color="primary" className="stake-button" onClick={connect} key={1}>
  //     Connect Wallet
  //   </Button>
  // );

  return (
    <div id="presale-view">
        <Grid item className={`ohm-card`}>
            <div className="stake-top-metrics">
            {!ended && starttime && 
                  <Box mb={3}>
                    <Typography variant="h4" color="textSecondary" className="title">
                      {started ? 'PreSale Ends In' : 'PreSale Starts In'}
                    </Typography>
                    <ProgressCountdown base={moment().toDate()} hideBar={true} deadline={started ? endtime : starttime} description="Presale Starts" />
                  </Box>
                }
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  <Paper className="presale-card">
                    <Typography variant="body1" className="presale-note" color="textSecondary">
                      {ended ? 
                      <>
                      Presale ended
                      </> : started ? <div style={{color:'#2cd337'}}>
                        Presale now is live
                      </div> :
                      <>
                      Presale is not open yet
                      </>}
                    </Typography>
                    <Typography variant="h4" color="textSecondary" className="title">
                      Contribute To Get ANT<br/><br/>
                    </Typography>
                    <Grid container className="claimarea">
                        <Grid xs={12} sm={6} md={6} lg={6} style={{marginBottom: '10px'}}>
                          <FormControl className="deposit-input" variant="outlined">
                            <InputLabel htmlFor="amount-input"></InputLabel>
                            <OutlinedInput
                              id="amount-input"
                              type="number"
                              placeholder="Enter an amount"
                              className="stake-input"
                              value={quantity}
                              width="70%"
                              onChange={e => setQuantity(e.target.value)}
                              labelWidth={0}
                              endAdornment={
                                <InputAdornment position="end">
                                  <Button variant="text" onClick={setMax} color="inherit">
                                    Max
                                  </Button>
                                </InputAdornment>
                              }
                            />
                          </FormControl>
                        </Grid>
                        <Grid xs={12} sm={6} md={6} lg={6} style={{marginBottom: '10px'}}>
                          <Button
                            className="stake-button"
                            variant="contained"
                            color="primary"
                            disabled={isAllowanceDataLoading || isPendingTxn(pendingTransactions, "deposit")}
                            onClick={() => {
                              onChangeDeposit("presale");
                            }}
                          >
                            {txnButtonText(pendingTransactions, "deposit", "Contribute")}
                          </Button>
                        </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Paper className="presale-card">
                    <Typography variant="h6" color="textSecondary">
                      Your ANT Balance:
                    </Typography>
                    <Typography variant="h4" color="textSecondary" className="title">
                    {ANTBalance ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(ANTBalance): 0} ANT<br/><br/>
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                      Your Available Contribute Amount:
                    </Typography>
                    <Typography variant="h4" color="textSecondary" className="title">
                    {capable ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(capable): 0} BNB<br/><br/>
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                      Your Contributed Amount:
                    </Typography>
                    <Typography variant="h4" color="textSecondary" className="title">
                    {userInfo ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(userInfo): 0} BNB<br/><br/>
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                      Total Contributed Amount:
                    </Typography>
                    {totalRaisedBNB && (<Progress animation={3} completed={totalRaisedBNB/hardCap} className="progress">
                      <p>
                      {userInfo ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                      }).format(totalRaisedBNB/hardCap): 0}%
                      </p>
                    </Progress>)}
                    <Typography variant="h4" color="textSecondary" className="title">
                    {totalRaisedBNB ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(totalRaisedBNB): 0} BNB<br/><br/>
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                      Total Token Sold Amount:
                    </Typography>
                    {soldAmount && (<Progress animation={3} completed={soldAmount/50000000} color="#f44336" className="progress">
                      <p>
                      {userInfo ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                      }).format(soldAmount/50000000): 0}%
                      </p>
                    </Progress>)}
                    <Typography variant="h4" color="textSecondary" className="title">
                    {soldAmount ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(soldAmount): 0} ANT<br/>
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Paper className="presale-card">
                    <Typography variant="h6" color="textSecondary">
                    HardCap:
                    </Typography>
                    <Typography variant="h4" color="textSecondary" className="title">
                    {hardCap ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(hardCap): 0} BNB<br/><br/>
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                    PreSale Price:
                    </Typography>
                    <Typography variant="h4" color="textSecondary" className="title">
                    {price ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(price):0} ANT <small>Per 1BNB</small><br/><br/>
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                    Launch Price:
                    </Typography>
                    <Typography variant="h4" color="textSecondary" className="title">
                    {price ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(5000):0} ANT <small>Per 1BNB</small><br/><br/>
                    </Typography>
                    <Typography variant="h6" color="textSecondary" style={minEthlimit && {marginBottom:'10px'}}>
                      Min Contribute:
                    </Typography>
                    <Typography variant="h4" color="textSecondary" className="title">
                    {minEthlimit ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(minEthlimit):0} BNB <small>Per Wallet</small><br/><br/>
                    </Typography>
                    <Typography variant="h6" color="textSecondary" style={minEthlimit && {marginBottom:'10px'}}>
                      Max Contribute:
                    </Typography>
                    <Typography variant="h4" color="textSecondary" className="title">
                    {minEthlimit ? new Intl.NumberFormat({
                      style: "currency",
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0,
                    }).format(maxEthlimit):0} BNB <small>Per Wallet</small><br/>
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper className="presale-card contract-area" >
                    <div className="contract-area">
                      <img src={logoImg} height="70px" width= "70px" style={{ marginTop: "7px" }}/>
                      <Typography variant="h6" className="puretext">
                        <p className="title">ANT Token Address</p>
                        <Link href={`https://bscscan.com/address/${ANT_ADDRESS}`} target="_blank">{smallerScreen ? shorten(ANT_ADDRESS) : ANT_ADDRESS}</Link>
                      </Typography>
                    </div>
                    <div className="contract-area">
                      <img src={contractImg} height="70px" width= "70px" style={{ marginTop: "7px" }}/>
                      <Typography variant="h6" className="puretext">
                        <p className="title">Presale Contract Address</p>
                        <Link href={`https://bscscan.com/address/${PRESALE_ADDRESS}`} target="_blank">{smallerScreen ? shorten(PRESALE_ADDRESS) : PRESALE_ADDRESS}</Link>
                      </Typography>
                    </div>
                  </Paper>
                </Grid>
              </Grid>
            </div>
        </Grid>
    </div>
  );
}

export default Presale;
