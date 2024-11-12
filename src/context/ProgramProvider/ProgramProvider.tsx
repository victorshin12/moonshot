import { AnchorProvider, Program } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { ReactNode, useEffect, useReducer, useState } from "react";
import { ProgramActionTypes, reducer } from "./reducer";
import { ProgramContext, initalState } from "./state";

type ProgramProviderProps = {
  children: ReactNode;
};

export const ProgramProvider = ({ children }: ProgramProviderProps) => {
  const [program, dispatch] = useReducer(reducer, initalState);
  const [provider, setProvider] = useState<AnchorProvider | null>(null);
  const wallet = useWallet();
  const connection = new Connection(process.env.NEXT_PUBLIC_NODE!);

  useEffect(() => {
    if (connection !== null) {
      setProvider(
        new AnchorProvider(
          connection,
          wallet as any,
          AnchorProvider.defaultOptions()
        )
      );
    }
  }, [wallet.publicKey?.toString()]);

  const setProgram = async () => {
    try {
      if (provider !== null && wallet.publicKey) {
        const program = await Program.at(
          new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!),
          provider
        );
        dispatch({
          type: ProgramActionTypes.SET_PROGRAM,
          payload: program,
        });
        console.log("Program set", program);
      }
    } catch (error) {
      throw "Cannot set program";
    }
  };

  useEffect(() => {
    if (provider && wallet?.publicKey?.toString()) {
      setProgram();
    }
  }, [provider?.wallet?.publicKey?.toString()]);

  return (
    <ProgramContext.Provider value={program}>
      {children}
    </ProgramContext.Provider>
  );
};
