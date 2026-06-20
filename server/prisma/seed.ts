/**
 * Database seed for the reinsurance market-intelligence app.
 *
 * Creates an ADMIN user, a set of countries (Africa / Middle East / Asia /
 * Europe) with insurance-regulator details and regulatory-framework notes, a
 * few demo cedants, and sample meeting reports.
 *
 * Regulator names, websites and contact details were verified against each
 * authority's official site (and reputable industry sources) at seed-authoring
 * time. Where a specific contact field could not be confirmed it is left null
 * rather than guessed. Mandatory-cession rates reflect the published
 * cession hierarchy (Africa Re, ZEP-RE, CICA-RE, national reinsurers, etc.).
 *
 * Run with: npm run prisma:seed  (or `npx prisma db seed`)
 */
import { CompanyType, MeetingType, Prisma, PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@marketintel.local';
const ADMIN_PASSWORD = 'Admin123!';

interface CountrySeed {
  code: string;
  name: string;
  regulatoryFramework: string;
  regulatorName: string;
  regulatorWebsite: string;
  regulatorEmail: string | null;
  regulatorPhone: string | null;
  regulatorAddress: string | null;
  mandatoryCessions?: Prisma.InputJsonValue;
}

// --- Africa ---------------------------------------------------------------
const countries: CountrySeed[] = [
  {
    code: 'ET',
    name: 'Ethiopia',
    regulatorName: 'National Bank of Ethiopia (NBE)',
    regulatorWebsite: 'https://nbe.gov.et',
    regulatorEmail: 'nbeinfo@nbe.gov.et',
    regulatorPhone: '+251 11 551 7430',
    regulatorAddress: 'Sudan Street, Addis Ababa (P.O. Box 5550)',
    regulatoryFramework:
      'Insurance business is licensed and supervised by the National Bank of Ethiopia ' +
      'through its Insurance Supervision Directorate under the Insurance Business ' +
      'Proclamation and NBE directives. A compulsory cession to the national reinsurer ' +
      'Ethiopian Reinsurance (Ethio-Re, established 2016) applies, in addition to the ' +
      '5% legal cession to Africa Re.',
    mandatoryCessions: [
      {
        reinsurer: 'Ethiopian Reinsurance (Ethio-Re)',
        basis: 'compulsory national cession',
        note: 'Compulsory cession to the national reinsurer under NBE reinsurance directives',
      },
      { reinsurer: 'Africa Re', rate: 5, basis: 'legal cession' },
    ],
  },
  {
    code: 'KE',
    name: 'Kenya',
    regulatorName: 'Insurance Regulatory Authority (IRA)',
    regulatorWebsite: 'https://www.ira.go.ke',
    regulatorEmail: 'customercare@ira.go.ke',
    regulatorPhone: '+254 20 4996000',
    regulatorAddress: 'Zep-Re Place, Longonot Road, Upper Hill, P.O. Box 43505-00100, Nairobi',
    regulatoryFramework:
      'Supervised by the Insurance Regulatory Authority under the Insurance Act (Cap 487). ' +
      'Compulsory cession to the state-controlled Kenya Reinsurance Corporation (Kenya Re) ' +
      'applies to general business, raised from 20% to 25% effective 2026, alongside ' +
      'regional and continental cessions to ZEP-RE and Africa Re.',
    mandatoryCessions: [
      {
        reinsurer: 'Kenya Re',
        rate: 25,
        basis: 'compulsory cession (general business)',
        note: 'Increased from 20% to 25% effective 2026',
      },
      { reinsurer: 'ZEP-RE', rate: 10, basis: 'COMESA regional cession' },
      { reinsurer: 'Africa Re', rate: 5, basis: 'legal cession' },
    ],
  },
  {
    code: 'NG',
    name: 'Nigeria',
    regulatorName: 'National Insurance Commission (NAICOM)',
    regulatorWebsite: 'https://naicom.gov.ng',
    regulatorEmail: 'contact@naicom.gov.ng',
    regulatorPhone: '+234 9 875 6021',
    regulatorAddress: 'Plot 1239 Ladoke Akintola Boulevard, Garki II, Abuja',
    regulatoryFramework:
      'Regulated by the National Insurance Commission under the Insurance Act 2003 and the ' +
      'NAICOM Act 1997. The 5% legal cession to Africa Re applies; NAICOM also enforces ' +
      'local-retention / local-content rules governing outward reinsurance placements.',
    mandatoryCessions: [{ reinsurer: 'Africa Re', rate: 5, basis: 'legal cession' }],
  },
  {
    code: 'GH',
    name: 'Ghana',
    regulatorName: 'National Insurance Commission (NIC)',
    regulatorWebsite: 'https://nicgh.org',
    regulatorEmail: 'info@nicgh.org',
    regulatorPhone: '+233 302 238300',
    regulatorAddress: 'Appiah Ampofo House, 67 Independence Avenue, Cantonments, P.O. Box CT 3456, Accra',
    regulatoryFramework:
      'Supervised by the National Insurance Commission under the Insurance Act, 2021 (Act 1061). ' +
      'The 5% legal cession to Africa Re applies, with local reinsurers (e.g. Ghana Re) and ' +
      'NIC placement rules favouring domestic retention.',
    mandatoryCessions: [{ reinsurer: 'Africa Re', rate: 5, basis: 'legal cession' }],
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    regulatorName: 'Tanzania Insurance Regulatory Authority (TIRA)',
    regulatorWebsite: 'https://www.tira.go.tz',
    regulatorEmail: null,
    regulatorPhone: '+255 22 2132537',
    regulatorAddress: 'TIRA House, Block 33, Plot 85/2115, Mtendeni Street, P.O. Box 9892, Dar es Salaam',
    regulatoryFramework:
      'Regulated by the Tanzania Insurance Regulatory Authority under the Insurance Act, 2009. ' +
      'A layered compulsory cession applies: 20% to the national reinsurer Tan Re, 10% to ' +
      'ZEP-RE and 5% to Africa Re.',
    mandatoryCessions: [
      { reinsurer: 'Tan Re', rate: 20, basis: 'compulsory national cession' },
      { reinsurer: 'ZEP-RE', rate: 10, basis: 'COMESA regional cession' },
      { reinsurer: 'Africa Re', rate: 5, basis: 'legal cession' },
    ],
  },
  {
    code: 'UG',
    name: 'Uganda',
    regulatorName: 'Insurance Regulatory Authority of Uganda (IRA Uganda)',
    regulatorWebsite: 'https://ira.go.ug',
    regulatorEmail: 'ira@ira.go.ug',
    regulatorPhone: '+256 41 7425500',
    regulatorAddress: 'Insurance Towers, Plot 6 Lumumba Avenue, P.O. Box 22855, Kampala',
    regulatoryFramework:
      'Supervised by the Insurance Regulatory Authority of Uganda under the Insurance Act, 2017. ' +
      'Compulsory cessions of 15% to Uganda Re, 10% to ZEP-RE and 5% to Africa Re apply.',
    mandatoryCessions: [
      { reinsurer: 'Uganda Re', rate: 15, basis: 'compulsory national cession' },
      { reinsurer: 'ZEP-RE', rate: 10, basis: 'COMESA regional cession' },
      { reinsurer: 'Africa Re', rate: 5, basis: 'legal cession' },
    ],
  },
  {
    code: 'EG',
    name: 'Egypt',
    regulatorName: 'Financial Regulatory Authority (FRA)',
    regulatorWebsite: 'https://fra.gov.eg',
    regulatorEmail: 'tsei@fra.gov.eg',
    regulatorPhone: '+20 2 35345350',
    regulatorAddress: 'Smart Village, Building 136B, Km 28 Cairo–Alexandria Desert Road, Giza',
    regulatoryFramework:
      'Insurance and other non-banking financial activities are supervised by the Financial ' +
      'Regulatory Authority (FRA), which succeeded the Egyptian Insurance Supervisory Authority. ' +
      'Reinsurance is placed on commercial terms (Egyptian Re); no statutory legal cession applies.',
  },
  {
    code: 'MA',
    name: 'Morocco',
    regulatorName: "Autorité de Contrôle des Assurances et de la Prévoyance Sociale (ACAPS)",
    regulatorWebsite: 'https://www.acaps.ma',
    regulatorEmail: null,
    regulatorPhone: null,
    regulatorAddress: 'Rabat, Morocco',
    regulatoryFramework:
      'Insurance and social welfare are supervised by ACAPS (established by Law 64-12) under the ' +
      'Insurance Code (Law 17-99). The historic legal cession to the Société Centrale de ' +
      'Réassurance (SCR) has been progressively phased out toward market liberalisation.',
  },
  {
    code: 'ZA',
    name: 'South Africa',
    regulatorName: 'Prudential Authority (South African Reserve Bank)',
    regulatorWebsite: 'https://www.resbank.co.za',
    regulatorEmail: null,
    regulatorPhone: null,
    regulatorAddress: 'South African Reserve Bank, 370 Helen Joseph Street, Pretoria',
    regulatoryFramework:
      'South Africa operates a Twin Peaks model under the Financial Sector Regulation Act, 2017: ' +
      'the Prudential Authority (within the SARB) handles prudential supervision of insurers under ' +
      'the Insurance Act, 2017, while the Financial Sector Conduct Authority (FSCA) handles market ' +
      'conduct. No mandatory cession applies.',
  },

  // --- Middle East --------------------------------------------------------
  {
    code: 'AE',
    name: 'United Arab Emirates',
    regulatorName: 'Central Bank of the UAE (CBUAE)',
    regulatorWebsite: 'https://www.centralbank.ae',
    regulatorEmail: null,
    regulatorPhone: null,
    regulatorAddress: 'Abu Dhabi, United Arab Emirates',
    regulatoryFramework:
      'Insurance and reinsurance are licensed and supervised by the Central Bank of the UAE, ' +
      'which absorbed the former Insurance Authority under Federal Decree-Law No. 25 of 2020. ' +
      'Supervision follows the Insurance Law (Federal Law No. 6 of 2007, as amended) and CBUAE ' +
      'regulations. No mandatory cession applies.',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    regulatorName: 'Insurance Authority (IA)',
    regulatorWebsite: 'https://ia.gov.sa',
    regulatorEmail: null,
    regulatorPhone: null,
    regulatorAddress: 'Riyadh, Saudi Arabia',
    regulatoryFramework:
      'The Insurance Authority (established 2023/2024) is the sole regulator of the insurance ' +
      'sector, having taken over insurance supervision from the Saudi Central Bank (SAMA). ' +
      'Supervision follows the Cooperative Insurance Companies Control Law and IA regulations. ' +
      'No mandatory cession applies.',
  },

  // --- Asia ---------------------------------------------------------------
  {
    code: 'IN',
    name: 'India',
    regulatorName: 'Insurance Regulatory and Development Authority of India (IRDAI)',
    regulatorWebsite: 'https://irdai.gov.in',
    regulatorEmail: null,
    regulatorPhone: null,
    regulatorAddress: 'Survey No. 115/1, Financial District, Nanakramguda, Hyderabad 500032',
    regulatoryFramework:
      'Regulated by IRDAI under the Insurance Act, 1938 and the IRDA Act, 1999. An obligatory ' +
      'cession to the national reinsurer GIC Re applies, with the percentage set annually by IRDAI.',
    mandatoryCessions: [
      {
        reinsurer: 'GIC Re',
        basis: 'obligatory cession',
        note: 'Percentage of each policy set annually by IRDAI',
      },
    ],
  },
  {
    code: 'SG',
    name: 'Singapore',
    regulatorName: 'Monetary Authority of Singapore (MAS)',
    regulatorWebsite: 'https://www.mas.gov.sg',
    regulatorEmail: null,
    regulatorPhone: null,
    regulatorAddress: '10 Shenton Way, MAS Building, Singapore 079117',
    regulatoryFramework:
      'Insurance is regulated by the Monetary Authority of Singapore under the Insurance Act 1966. ' +
      'Singapore is a major regional reinsurance hub with an open, risk-based regime and no ' +
      'mandatory cession.',
  },

  // --- Europe -------------------------------------------------------------
  {
    code: 'GB',
    name: 'United Kingdom',
    regulatorName: 'Prudential Regulation Authority (Bank of England)',
    regulatorWebsite: 'https://www.bankofengland.co.uk/prudential-regulation',
    regulatorEmail: null,
    regulatorPhone: null,
    regulatorAddress: 'Bank of England, Threadneedle Street, London EC2R 8AH',
    regulatoryFramework:
      'Dual regulation under the Financial Services and Markets Act 2000: the Prudential ' +
      'Regulation Authority (part of the Bank of England) supervises insurer safety and ' +
      'soundness while the Financial Conduct Authority (FCA) supervises conduct. The UK ' +
      'operates a tailored post-Solvency II prudential regime. No mandatory cession applies.',
  },
  {
    code: 'DE',
    name: 'Germany',
    regulatorName: 'Federal Financial Supervisory Authority (BaFin)',
    regulatorWebsite: 'https://www.bafin.de',
    regulatorEmail: null,
    regulatorPhone: null,
    regulatorAddress: 'Graurheindorfer Straße 108, 53117 Bonn',
    regulatoryFramework:
      'Insurers and reinsurers are supervised by BaFin under the Insurance Supervision Act (VAG) ' +
      'within the EU Solvency II framework. No mandatory cession applies.',
  },
  {
    code: 'FR',
    name: 'France',
    regulatorName: 'Autorité de contrôle prudentiel et de résolution (ACPR)',
    regulatorWebsite: 'https://acpr.banque-france.fr',
    regulatorEmail: null,
    regulatorPhone: null,
    regulatorAddress: '4 Place de Budapest, CS 92459, 75436 Paris Cedex 09',
    regulatoryFramework:
      'Insurers and reinsurers are supervised by the ACPR, which is backed by the Banque de ' +
      'France, under the Insurance Code (Code des assurances) within the EU Solvency II ' +
      'framework. No mandatory cession applies.',
  },
];

interface CompanySeed {
  countryCode: string;
  name: string;
  type: CompanyType;
  headquarters: string;
  website?: string;
  notes?: string;
}

const companies: CompanySeed[] = [
  {
    countryCode: 'ET',
    name: 'Ethiopian Insurance Corporation',
    type: CompanyType.CEDANT,
    headquarters: 'Addis Ababa, Ethiopia',
    notes: 'State-owned composite insurer; largest cedant in the Ethiopian market.',
  },
  {
    countryCode: 'KE',
    name: 'Britam General Insurance Company (Kenya)',
    type: CompanyType.CEDANT,
    headquarters: 'Nairobi, Kenya',
    notes: 'Leading East African short-term insurer.',
  },
  {
    countryCode: 'KE',
    name: 'Kenya Reinsurance Corporation (Kenya Re)',
    type: CompanyType.REINSURER,
    headquarters: 'Nairobi, Kenya',
    notes: 'State-controlled national reinsurer; beneficiary of compulsory cessions.',
  },
  {
    countryCode: 'NG',
    name: 'Leadway Assurance Company',
    type: CompanyType.CEDANT,
    headquarters: 'Lagos, Nigeria',
    notes: 'One of Nigeria’s largest privately held insurers.',
  },
  {
    countryCode: 'GH',
    name: 'Enterprise Insurance',
    type: CompanyType.CEDANT,
    headquarters: 'Accra, Ghana',
    notes: 'Long-established Ghanaian general insurer.',
  },
  {
    countryCode: 'TZ',
    name: 'National Insurance Corporation of Tanzania (NIC)',
    type: CompanyType.CEDANT,
    headquarters: 'Dar es Salaam, Tanzania',
    notes: 'State-owned Tanzanian insurer.',
  },
  {
    countryCode: 'EG',
    name: 'Misr Insurance Company',
    type: CompanyType.CEDANT,
    headquarters: 'Cairo, Egypt',
    notes: 'Largest insurer in the Egyptian market.',
  },
];

async function main(): Promise<void> {
  // 1. Admin user --------------------------------------------------------
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: Role.ADMIN },
    create: {
      email: ADMIN_EMAIL,
      name: 'Market Intel Admin',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Admin user ready: ${admin.email}`);

  // 2. Countries (idempotent via unique code) ----------------------------
  const countryIdByCode = new Map<string, string>();
  for (const c of countries) {
    const data = {
      name: c.name,
      regulatoryFramework: c.regulatoryFramework,
      regulatorName: c.regulatorName,
      regulatorWebsite: c.regulatorWebsite,
      regulatorEmail: c.regulatorEmail,
      regulatorPhone: c.regulatorPhone,
      regulatorAddress: c.regulatorAddress,
      ...(c.mandatoryCessions !== undefined ? { mandatoryCessions: c.mandatoryCessions } : {}),
    };
    const country = await prisma.country.upsert({
      where: { code: c.code },
      update: data,
      create: { code: c.code, ...data },
    });
    countryIdByCode.set(c.code, country.id);
  }
  console.log(`Seeded ${countries.length} countries.`);

  // 3. Demo companies (idempotent by name) -------------------------------
  const companyIdByName = new Map<string, string>();
  for (const co of companies) {
    const countryId = countryIdByCode.get(co.countryCode);
    if (!countryId) continue;
    const existing = await prisma.company.findFirst({ where: { name: co.name } });
    const company =
      existing ??
      (await prisma.company.create({
        data: {
          name: co.name,
          countryId,
          type: co.type,
          headquarters: co.headquarters,
          website: co.website,
          notes: co.notes,
        },
      }));
    companyIdByName.set(co.name, company.id);
  }
  console.log(`Seeded ${companies.length} companies.`);

  // 4. Demo meeting reports (only if none exist yet) ---------------------
  const existingReports = await prisma.meetingReport.count();
  if (existingReports === 0) {
    const kenyaId = countryIdByCode.get('KE')!;
    const nigeriaId = countryIdByCode.get('NG')!;
    const ethiopiaId = countryIdByCode.get('ET')!;

    await prisma.meetingReport.createMany({
      data: [
        {
          type: MeetingType.CONFERENCE,
          countryId: kenyaId,
          authorId: admin.id,
          meetingDate: new Date('2026-05-12T09:00:00Z'),
          location: 'Nairobi, Kenya',
          attendees: ['Kenya Re underwriting team', 'IRA representatives', 'Broker delegation'],
          rawNotes:
            'Market overview session at the East Africa reinsurance forum. Discussed the rise in ' +
            'Kenya Re compulsory cession to 25% and its impact on treaty placements.',
          summaryBullets: [
            'Kenya Re compulsory cession rises from 20% to 25% in 2026.',
            'Brokers expect tighter retentions and pressure on outward placements.',
            'IRA signalled continued focus on local premium retention.',
          ],
          actionItems: [
            'Model the impact of the 25% cession on 2026 treaty renewals.',
            'Schedule follow-up with Kenya Re underwriting team.',
          ],
          tags: ['kenya', 'market-overview', 'cession'],
        },
        {
          type: MeetingType.MEETING,
          countryId: kenyaId,
          companyId: companyIdByName.get('Britam General Insurance Company (Kenya)') ?? null,
          authorId: admin.id,
          meetingDate: new Date('2026-05-14T13:30:00Z'),
          location: 'Britam Tower, Nairobi',
          attendees: ['Britam Chief Underwriting Officer', 'Reinsurance manager'],
          rawNotes:
            'Renewal discussion for the property treaty. Britam keen to increase capacity and ' +
            'review event limits ahead of the 1 July renewal.',
          summaryBullets: [
            'Britam seeking increased property treaty capacity for 2026/27.',
            'Event limit and reinstatement terms to be revisited.',
          ],
          actionItems: [
            'Prepare revised property treaty quote with higher event limit.',
            'Confirm reinstatement pricing before 1 July renewal.',
          ],
          tags: ['kenya', 'renewal', 'property-treaty'],
        },
        {
          type: MeetingType.CALL,
          countryId: nigeriaId,
          companyId: companyIdByName.get('Leadway Assurance Company') ?? null,
          authorId: admin.id,
          meetingDate: new Date('2026-05-18T11:00:00Z'),
          location: 'Conference call',
          attendees: ['Leadway treaty team'],
          rawNotes:
            'Call to align on facultative support for a large energy risk. Confirmed Africa Re ' +
            '5% legal cession and discussed local-content requirements under NAICOM rules.',
          summaryBullets: [
            'Facultative support requested for a large energy risk.',
            'Africa Re 5% legal cession confirmed; NAICOM local-content rules apply.',
          ],
          actionItems: [
            'Send facultative slip for the energy risk.',
            'Confirm NAICOM local-retention compliance.',
          ],
          tags: ['nigeria', 'facultative', 'energy'],
        },
        {
          type: MeetingType.SITE_VISIT,
          countryId: ethiopiaId,
          companyId: companyIdByName.get('Ethiopian Insurance Corporation') ?? null,
          authorId: admin.id,
          meetingDate: new Date('2026-05-21T08:30:00Z'),
          location: 'Addis Ababa, Ethiopia',
          attendees: ['EIC reinsurance department', 'Ethio-Re liaison'],
          rawNotes:
            'Site visit covering the NBE reinsurance directives and the compulsory cession to ' +
            'Ethio-Re. EIC outlined its retention strategy under the current framework.',
          summaryBullets: [
            'NBE directives mandate compulsory cession to Ethio-Re plus 5% to Africa Re.',
            'EIC reviewing retention strategy under the national reinsurer framework.',
          ],
          actionItems: [
            'Obtain the latest NBE reinsurance directive text.',
            'Map EIC outward placements against compulsory cession requirements.',
          ],
          tags: ['ethiopia', 'regulatory', 'cession'],
        },
      ],
    });
    console.log('Seeded demo meeting reports.');
  } else {
    console.log('Meeting reports already present; skipping demo reports.');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
