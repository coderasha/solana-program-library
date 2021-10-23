import { struct, u8 } from '@solana/buffer-layout';
import { u64 } from '@solana/buffer-layout-utils';
import { PublicKey, Signer, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '../constants';
import { TokenInstruction } from './types';
import { addSigners } from './utils';

const dataLayout = struct<{
    instruction: TokenInstruction;
    amount: bigint;
    decimals: number;
}>([u8('instruction'), u64('amount'), u8('decimals')]);

/**
 * Construct an ApproveChecked instruction
 *
 * @param account      Public key of the account
 * @param mint         Mint account
 * @param delegate     Account authorized to perform a transfer of tokens from the source account
 * @param owner        Owner of the source account
 * @param multiSigners Signing accounts if `owner` is a multiSig
 * @param amount       Maximum number of tokens the delegate may transfer
 * @param decimals     Number of decimals in approve amount
 * @param programId    SPL Token program account
 *
 * @return Instruction to add to a transaction
 */
export function createApproveCheckedInstruction(
    account: PublicKey,
    mint: PublicKey,
    delegate: PublicKey,
    owner: PublicKey,
    multiSigners: Signer[],
    amount: number | bigint,
    decimals: number,
    programId = TOKEN_PROGRAM_ID
): TransactionInstruction {
    const keys = addSigners(
        [
            { pubkey: account, isSigner: false, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: delegate, isSigner: false, isWritable: false },
        ],
        owner,
        multiSigners
    );

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
        {
            instruction: TokenInstruction.ApproveChecked,
            amount: BigInt(amount),
            decimals,
        },
        data
    );

    return new TransactionInstruction({ keys, programId, data });
}
