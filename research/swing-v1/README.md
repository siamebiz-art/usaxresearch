# Swing Assistant — strategy v1 research (6 Oct 2026)

Result: swing-v1.0 does not beat random entry dates and loses badly to buy & hold / DCA.
Report: https://claude.ai/artifact/F5TnhQcDouYVrKE3YJ9jAq (source: swing-assistant.html)

    node fetch.mjs            # download daily OHLC (Yahoo, dividend-adjusted) into data/
    node check.ts             # simulator self-checks on real data
    node mksyn.mjs && SWING_DATA=data_syn node check.ts   # zero-drift synthetic: avgR must be ~0
    node exp.ts               # main comparison (COST=0.25, CASH=4 for sensitivity)
    node now.ts               # rule status on the latest close

Run the synthetic check with several seeds before trusting any new rule: a no-edge price series must give ~0R per trade.
