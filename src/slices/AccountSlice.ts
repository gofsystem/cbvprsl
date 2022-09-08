import { ethers } from "ethers";
import { addresses } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
// import { abi as sOHMv2 } from "../abi/sOhmv2.json";
import { abi as presaleabi } from "../abi/Presale.json";
import { setAll } from "../helpers";

import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
// import { Bond, NetworkID } from "src/lib/Bond"; // TODO: this type definition needs to move out of BOND.
import { RootState } from "src/store";
import { IBaseAddressAsyncThunk, ICalcUserBondDetailsAsyncThunk } from "./interfaces";
import { Web3Provider } from "@ethersproject/providers";

export const getBalances = createAsyncThunk(
  "account/getBalances",
  async ({ address, networkID, provider }: IBaseAddressAsyncThunk) => {
    const ohmContract = new ethers.Contract(addresses[networkID].HEC_ADDRESS as string, ierc20Abi, provider);
    const hecBalance = await ohmContract.balanceOf(address);
    // const sohmContract = new ethers.Contract(addresses[networkID].SHEC_ADDRESS as string, ierc20Abi, provider);
    // const shecBalance = await sohmContract.balanceOf(address);
    // let poolBalance = 0;
    // const poolTokenContract = new ethers.Contract(addresses[networkID].PT_TOKEN_ADDRESS as string, ierc20Abi, provider);
    // poolBalance = await poolTokenContract.balanceOf(address);

    return {
      balances: {
        ohm: ethers.utils.formatUnits(hecBalance, "gwei"),
        // sohm: ethers.utils.formatUnits(shecBalance, "gwei"),
        // pool: ethers.utils.formatUnits(poolBalance, "gwei"),
      },
    };
  },
);

export const loadAccountDetails = createAsyncThunk(
  "account/loadAccountDetails",
  async ({ networkID, provider, address }: IBaseAddressAsyncThunk) => {
    let hecBalance = 0;
    // let oldshecBalance = 0;
    // let stakeAllowance = 0;
    // let unstakeAllowance = 0;
    // let oldunstakeAllowance = 0;
    // let daiBondAllowance = 0;
    // let poolAllowance = 0;
    // let presaleAllowance = 0;

    // const busdContract = new ethers.Contract(addresses[networkID].BUSD_ADDRESS as string, ierc20Abi, provider);
    // const busdBalance = await busdContract.balanceOf(address);
    const etherBalance = await provider.getBalance(address);
    const ohmContract = new ethers.Contract(addresses[networkID].HEC_ADDRESS as string, ierc20Abi, provider);
    hecBalance = await ohmContract.balanceOf(address);
    // stakeAllowance = await ohmContract.allowance(address, addresses[networkID].STAKING_HELPER_ADDRESS);

    // const sohmContract = new ethers.Contract(addresses[networkID].SHEC_ADDRESS as string, sOHMv2, provider);
    // shecBalance = await sohmContract.balanceOf(address);
    // unstakeAllowance = await sohmContract.allowance(address, addresses[networkID].STAKING_ADDRESS);
    // poolAllowance = await sohmContract.allowance(address, addresses[networkID].PT_PRIZE_POOL_ADDRESS);

    // const oldshecContract = new ethers.Contract(addresses[networkID].OLD_SHEC_ADDRESS as string, sOHMv2, provider);
    // oldshecBalance = await oldshecContract.balanceOf(address);
    // oldunstakeAllowance = await oldshecContract.allowance(address, addresses[networkID].OLD_STAKING_ADDRESS);

    const presaleContract = new ethers.Contract(addresses[networkID].PRESALE_ADDRESS as string, presaleabi, provider);
    // const price = await presaleContract.tokenRatePerEth();

    // const startTime = await presaleContract.startTime();
    // const startTimestamp = new Date(startTime.mul(1000).toNumber());
    // const endTime = await presaleContract.endTime();
    // const endTimestamp = new Date(endTime.mul(1000).toNumber());

    // const minEthlimit = await presaleContract.minETHLimit();
    // const maxEthlimit = await presaleContract.maxETHLimit();
    // const hardCap = await presaleContract.hardCap();
    // const totalRaisedBNB = await presaleContract.totalRaisedBNB();
    // const soldAmount = await presaleContract.totaltokenSold();

    const capable = await presaleContract.getUserRemainingAllocation(address);
    const userInfo = await presaleContract.usersInvestments(address);

    // if (addresses[networkID].BUSD_ADDRESS) {
    //   presaleAllowance = await busdContract.allowance(address, addresses[networkID].PRESALE_ADDRESS);
    // }

    return {
      balances: {
        bnb: ethers.utils.formatEther(etherBalance),
        ohm: ethers.utils.formatEther(hecBalance),
        // sohm: ethers.utils.formatUnits(shecBalance, "gwei"),
        // oldshec: ethers.utils.formatUnits(oldshecBalance, "gwei"),
      },
      presale: {
        // price: price,
        // starttime: startTimestamp,
        // endtime: endTimestamp,
        capable: ethers.utils.formatEther(capable),
        userInfo: ethers.utils.formatEther(userInfo),
        // minEthlimit: ethers.utils.formatEther(minEthlimit),
        // maxEthlimit: ethers.utils.formatEther(maxEthlimit),
        // hardCap: ethers.utils.formatEther(hardCap),
        // totalRaisedBNB: ethers.utils.formatEther(totalRaisedBNB),
        // soldAmount: ethers.utils.formatEther(soldAmount),
      },
      // staking: {
      //   ohmStake: +stakeAllowance,
      //   ohmUnstake: +unstakeAllowance,
      //   oldhecUnstake: +oldunstakeAllowance,
      // },
      // bonding: {
      //   daiAllowance: daiBondAllowance,
      // },
      // pooling: {
      //   sohmPool: +poolAllowance,
      // },
    };
  },
);

// export interface IUserBondDetails {
//   allowance: number;
//   interestDue: number;
//   bondMaturationBlock: number;
//   pendingPayout: string; //Payout formatted in gwei.
// }
// export const calculateUserBondDetails = createAsyncThunk(
//   "account/calculateUserBondDetails",
//   async ({ address, bond, networkID, provider }: ICalcUserBondDetailsAsyncThunk) => {
//     if (!address) {
//       return {
//         bond: "",
//         displayName: "",
//         bondIconSvg: "",
//         isLP: false,
//         allowance: 0,
//         balance: "0",
//         interestDue: 0,
//         bondMaturationBlock: 0,
//         pendingPayout: "",
//       };
//     }
//     // dispatch(fetchBondInProgress());

//     // Calculate bond details.
//     const bondContract = bond.getContractForBond(networkID, provider);
//     const reserveContract = bond.getContractForReserve(networkID, provider);

//     let interestDue, pendingPayout, bondMaturationBlock;

//     const bondDetails = await bondContract.bondInfo(address);
//     interestDue = bondDetails.payout / Math.pow(10, 9);
//     bondMaturationBlock = +bondDetails.vesting + +bondDetails.lastBlock;
//     pendingPayout = await bondContract.pendingPayoutFor(address);

//     let allowance,
//       balance = 0;
//     allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
//     balance = await reserveContract.balanceOf(address);
//     // formatEthers takes BigNumber => String
//     // let balanceVal = ethers.utils.formatEther(balance);
//     // balanceVal should NOT be converted to a number. it loses decimal precision
//     let deciamls = 18;
//     if (bond.name == "usdc") {
//       deciamls = 6;
//     }
//     const balanceVal = balance / Math.pow(10, deciamls);
//     return {
//       bond: bond.name,
//       displayName: bond.displayName,
//       bondIconSvg: bond.bondIconSvg,
//       isLP: bond.isLP,
//       allowance: Number(allowance),
//       balance: balanceVal.toString(),
//       interestDue,
//       bondMaturationBlock,
//       pendingPayout: ethers.utils.formatUnits(pendingPayout, "gwei"),
//     };
//   },
// );

interface IAccountSlice {
  // bonds: { [key: string]: IUserBondDetails };
  balances: {
    ohm: string;
    sohm: string;
    dai: string;
    oldsohm: string;
  };
  loading: boolean;
}
const initialState: IAccountSlice = {
  loading: false,
  // bonds: {},
  balances: { ohm: "", sohm: "", dai: "", oldsohm: "" },
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    fetchAccountSuccess(state, action) {
      setAll(state, action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAccountDetails.pending, state => {
        state.loading = true;
      })
      .addCase(loadAccountDetails.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(loadAccountDetails.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      })
      .addCase(getBalances.pending, state => {
        state.loading = true;
      })
      .addCase(getBalances.fulfilled, (state, action) => {
        setAll(state, action.payload);
        state.loading = false;
      })
      .addCase(getBalances.rejected, (state, { error }) => {
        state.loading = false;
        console.log(error);
      });
      // .addCase(calculateUserBondDetails.pending, state => {
      //   state.loading = true;
      // })
      // .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
      //   if (!action.payload) return;
      //   const bond = action.payload.bond;
      //   state.bonds[bond] = action.payload;
      //   state.loading = false;
      // })
      // .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
      //   state.loading = false;
      //   console.log(error);
      // });
  },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
