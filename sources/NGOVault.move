module final_project::NGOVault;

use final_project::DreamNFT;
use sui::event;

public struct NGOVault has key {
    id: UID,
    ngo: address,
    dreamID: ID,
    matchAmount: u64,
    minMonths: u8,
    fulfilledMonths: u8,
    isActive: bool,
}

public struct MatchReleased has copy, drop {
    dreamID: ID,
    amount: u64,
    matchedBy: address,
}

public struct VaultCreated has copy, drop {
    dreamID: ID,
    ngo: address,
    id: ID,
}

public entry fun createVault(
    _: &DreamNFT::AdminCap,
    dreamID: ID,
    matchAmount: u64,
    minMonths: u8,
    ctx: &mut TxContext,
) {
    // let mut ctx = tx_context;
    let vault = NGOVault {
        id: object::new(ctx),
        ngo: ctx.sender(),
        dreamID: dreamID,
        matchAmount: matchAmount,
        minMonths: minMonths,
        fulfilledMonths: 0,
        isActive: true,
    };

    event::emit(VaultCreated {
        id: object::id(&vault),
        ngo: vault.ngo,
        dreamID: dreamID,
    });
    transfer::transfer(vault, ctx.sender());
}

public entry fun recordMonthlyContribution(vault: &mut NGOVault, dream: &DreamNFT::DreamNFT) {
    assert!(vault.isActive, 0);
    assert!(DreamNFT::getDreamID(dream) == vault.dreamID, 1);

    vault.fulfilledMonths = vault.fulfilledMonths + 1;
}

public entry fun releaseMatch(
    _: &DreamNFT::AdminCap,
    vault: &mut NGOVault,
    dream: &mut DreamNFT::DreamNFT,
    ctx: &mut TxContext,
) {
    assert!(vault.isActive, 0);
    assert!(vault.fulfilledMonths >= vault.minMonths, 1);
    assert!(vault.ngo == ctx.sender(), 2); // Only NGO can release
    assert!(DreamNFT::getDreamID(dream) == vault.dreamID, 3);

    DreamNFT::addMatchAmount(dream, vault.matchAmount);
    vault.isActive = false;

    // event::emit(MatchReleased {
    //     dreamID: object::id(&DreamNFT::getDreamID(dream)),
    //     amount: vault.matchAmount,
    //     matchedBy: vault.ngo,
    // });
}
