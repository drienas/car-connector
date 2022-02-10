module.exports = (args) => {
  if (
    args.gearbox &&
    !args.gearbox
      .split(',')
      .map((x) => x.trim())
      .every((x) =>
        ['Schaltgetriebe', 'Automatik', 'Halbautomatik'].includes(x)
      )
  )
    throw new Error(
      `(gearbox) Eine Getriebeart ist nicht vom Ausdruck [Schaltgetriebe, Automatik, Halbautomatik]`
    );
  if (
    args.useType &&
    !args.useType
      .split(',')
      .map((x) => x.trim())
      .every((x) =>
        [
          'Neuwagen',
          'Gebrauchtwagen',
          'Vorführwagen',
          'Tageszulassung',
          'Oldtimer',
        ].includes(x)
      )
  )
    throw new Error(
      `(useType) Ein Gebrauchtyp ist nicht vom Ausdruck [Neuwagen, Gebrauchtwagen, Vorführwagen, Tageszulassung, Oldtimer]`
    );
  if (
    args.fuelType &&
    !args.fuelType
      .split(',')
      .map((x) => x.trim())
      .every((x) =>
        [
          'Diesel',
          'Benzin',
          'Elektro',
          'LPG-Autogas',
          'Erdgas',
          'Wasserstoff',
          'Benzin+Elektro',
          'Diesel+Elektro',
          'Ethanol',
          'Benzin+Ethanol',
          'Diesel+Ethanol',
        ].includes(x)
      )
  )
    throw new Error(
      `(fuelType) Eine Kraftstoffart ist nicht vom Ausdruck [Diesel, Benzin, Elektro, LPG-Autogas, Erdgas, Wasserstoff, Benzin+Elektro, Diesel+Elektro, Ethanol, Benzin+Ethanol, Diesel+Ethanol]`
    );
};
