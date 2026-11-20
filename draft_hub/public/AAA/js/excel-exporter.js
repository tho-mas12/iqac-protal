// IQAC AAA 2026-2027 - Client-Side Excel (.xls/XML) & PDF Dossier Exporter
// Zero external dependencies, 100% offline and CORS-safe

class ExcelExporter {
  static escapeXml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  static generateXmlWorkbook(worksheets) {
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>IQAC - St. Joseph's College (Autonomous)</Author>
  <Created>${new Date().toISOString()}</Created>
  <Company>St. Joseph's College (Autonomous)</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94A3B8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B" ss:Bold="1"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Title">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Color="#1E3A8A" ss:Bold="1"/>
  </Style>
  <Style ss:ID="Cell">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="Currency">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="Number">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
   <NumberFormat ss:Format="0"/>
  </Style>
 </Styles>
`;

    for (const ws of worksheets) {
      xml += ` <Worksheet ss:Name="${this.escapeXml(ws.name.substring(0, 31))}">\n  <Table>\n`;
      for (const row of ws.rows) {
        xml += `   <Row>\n`;
        for (const cell of row) {
          const type = typeof cell.value === 'number' ? 'Number' : 'String';
          const styleAttr = cell.style ? ` ss:StyleID="${cell.style}"` : ` ss:StyleID="Cell"`;
          xml += `    <Cell${styleAttr}><Data ss:Type="${type}">${this.escapeXml(cell.value)}</Data></Cell>\n`;
        }
        xml += `   </Row>\n`;
      }
      xml += `  </Table>\n </Worksheet>\n`;
    }

    xml += `</Workbook>`;
    return xml;
  }

  static downloadFile(content, fileName, mimeType = 'application/vnd.ms-excel') {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  }

  // EXPORT SINGLE ATTRIBUTE TO EXCEL
  static exportAttributeToExcel(attrKey, data, deptName = 'Department') {
    const cleanDept = deptName.replace(/[^a-zA-Z0-9]/g, '_');
    const wsList = [];

    switch (attrKey) {
      case 'profile':
      case 't1_scholars': {
        const sch = data.departmentInfo?.scholars || { fullTime: { male: 0, female: 0 }, partTime: { male: 0, female: 0 } };
        wsList.push({
          name: 'Table 1 - Research Scholars',
          rows: [
            [{ value: `St. Joseph's College (Autonomous) - IQAC AAA 2026-2027`, style: 'Title' }],
            [{ value: `Department: ${deptName}`, style: 'SubHeader' }],
            [{ value: `Table 1: Research Scholars Profile`, style: 'SubHeader' }],
            [],
            [
              { value: 'Scholar Type', style: 'Header' },
              { value: 'Male', style: 'Header' },
              { value: 'Female', style: 'Header' },
              { value: 'Total', style: 'Header' }
            ],
            [
              { value: 'Full-Time (FT)' },
              { value: sch.fullTime?.male || 0, style: 'Number' },
              { value: sch.fullTime?.female || 0, style: 'Number' },
              { value: (sch.fullTime?.male || 0) + (sch.fullTime?.female || 0), style: 'Number' }
            ],
            [
              { value: 'Part-Time (PT)' },
              { value: sch.partTime?.male || 0, style: 'Number' },
              { value: sch.partTime?.female || 0, style: 'Number' },
              { value: (sch.partTime?.male || 0) + (sch.partTime?.female || 0), style: 'Number' }
            ],
            [
              { value: 'Grand Total Scholars', style: 'SubHeader' },
              { value: (sch.fullTime?.male || 0) + (sch.partTime?.male || 0), style: 'Number' },
              { value: (sch.fullTime?.female || 0) + (sch.partTime?.female || 0), style: 'Number' },
              { value: (sch.fullTime?.male || 0) + (sch.fullTime?.female || 0) + (sch.partTime?.male || 0) + (sch.partTime?.female || 0), style: 'Number' }
            ]
          ]
        });
        break;
      }

      case 'att1': {
        const att1 = data.attributeI || {};
        const vacRows = [
          [{ value: '1.1 Value Added Courses (VAC)', style: 'Title' }],
          [
            { value: '#', style: 'Header' },
            { value: 'Course Title', style: 'Header' },
            { value: 'Students Enrolled', style: 'Header' },
            { value: 'Fee Collected (INR)', style: 'Header' },
            { value: 'Collaborating Agency', style: 'Header' }
          ]
        ];
        (att1.vac || []).forEach((v, i) => {
          vacRows.push([
            { value: i + 1, style: 'Number' },
            { value: v.name || '' },
            { value: v.studentsEnrolled || 0, style: 'Number' },
            { value: v.feeCollected || 0, style: 'Currency' },
            { value: v.agenciesInvolved || '' }
          ]);
        });

        const ccRows = [
          [],
          [{ value: '1.2 Certificate Courses (CC)', style: 'Title' }],
          [
            { value: '#', style: 'Header' },
            { value: 'Course Title', style: 'Header' },
            { value: 'Students Enrolled', style: 'Header' },
            { value: 'Fee Collected (INR)', style: 'Header' },
            { value: 'Collaborating Agency', style: 'Header' }
          ]
        ];
        (att1.cc || []).forEach((c, i) => {
          ccRows.push([
            { value: i + 1, style: 'Number' },
            { value: c.name || '' },
            { value: c.studentsEnrolled || 0, style: 'Number' },
            { value: c.feeCollected || 0, style: 'Currency' },
            { value: c.agenciesInvolved || '' }
          ]);
        });

        wsList.push({
          name: 'Attribute I - Curriculum',
          rows: [
            [{ value: `IQAC AAA 2026-2027: ${deptName}`, style: 'Title' }],
            ...vacRows,
            ...ccRows
          ]
        });
        break;
      }

      case 'att2': {
        const att2 = data.attributeII || {};
        wsList.push({
          name: 'Attribute II - Faculty',
          rows: [
            [{ value: `IQAC AAA 2026-2027: ${deptName}`, style: 'Title' }],
            [{ value: 'Attribute II - Faculty Resources & Development', style: 'SubHeader' }],
            [],
            [{ value: 'Metric Description', style: 'Header' }, { value: 'Faculty Count', style: 'Header' }, { value: 'Details / Names', style: 'Header' }],
            [{ value: 'Faculty Receiving New Degrees' }, { value: att2.newDegrees?.count || 0, style: 'Number' }, { value: att2.newDegrees?.details || '' }],
            [{ value: 'NET / SET / JRF Qualified' }, { value: att2.netSet?.count || 0, style: 'Number' }, { value: att2.netSet?.details || '' }],
            [{ value: 'Members in BoS & Academic Bodies' }, { value: (att2.recognizedBodies?.bos || 0) + (att2.recognizedBodies?.auditMember || 0), style: 'Number' }, { value: `BoS: ${att2.recognizedBodies?.bos || 0}, Audit: ${att2.recognizedBodies?.auditMember || 0}` }],
            [{ value: 'Journal Reviewers & Editors' }, { value: (att2.researchJournals?.reviewers || 0) + (att2.researchJournals?.editors || 0), style: 'Number' }, { value: `Reviewers: ${att2.researchJournals?.reviewers || 0}, Editors: ${att2.researchJournals?.editors || 0}` }],
            [{ value: 'Resource Persons (National & Int\'l)' }, { value: (att2.resourcePerson?.international || 0) + (att2.resourcePerson?.national || 0), style: 'Number' }, { value: att2.resourcePerson?.details || '' }],
            [{ value: 'FDPs Attended' }, { value: (att2.fdp?.mmttc || 0) + (att2.fdp?.otherInstitutions || 0) + (att2.fdp?.institutional || 0), style: 'Number' }, { value: `MMTTC: ${att2.fdp?.mmttc || 0}, Other: ${att2.fdp?.otherInstitutions || 0}` }],
            [{ value: 'Abroad Visits for Academic Purpose' }, { value: att2.abroadVisits?.count || 0, style: 'Number' }, { value: att2.abroadVisits?.facultyNames || '' }]
          ]
        });
        break;
      }

      case 'att3': {
        const att3 = data.attributeIII || {};
        const eqList = att3.purchasedEquipments || [];
        const lib = att3.departmentLibrary || {};

        const eqRows = [
          [{ value: '3.1 Laboratory Equipment Procured in 2026-2027', style: 'SubHeader' }],
          [
            { value: '#', style: 'Header' },
            { value: 'Lab / Facility Name', style: 'Header' },
            { value: 'Equipment Name & Specs', style: 'Header' },
            { value: 'Type', style: 'Header' },
            { value: 'Purchase Date', style: 'Header' },
            { value: 'Amount (INR)', style: 'Header' }
          ]
        ];

        eqList.forEach((e, i) => {
          eqRows.push([
            { value: i + 1, style: 'Number' },
            { value: e.labName || '' },
            { value: e.equipmentName || '' },
            { value: e.type || '' },
            { value: e.purchaseDate || '' },
            { value: Number(e.amountINR) || 0, style: 'Currency' }
          ]);
        });

        const libRows = [
          [],
          [{ value: '3.2 Department Library Learning Resources', style: 'SubHeader' }],
          [{ value: 'Library Indicator', style: 'Header' }, { value: 'Count / Value', style: 'Header' }],
          [{ value: 'Books Purchased in 2026-2027' }, { value: lib.booksPurchased2026_2027 || 0, style: 'Number' }],
          [{ value: 'Total Books in Department' }, { value: lib.totalBooks || 0, style: 'Number' }],
          [{ value: 'National Journals Subscribed' }, { value: lib.nationalJournalsPurchased2026_2027 || 0, style: 'Number' }],
          [{ value: 'International Journals Subscribed' }, { value: lib.internationalJournalsPurchased2026_2027 || 0, style: 'Number' }],
          [{ value: 'Total Journals Subscribed' }, { value: lib.totalJournals || 0, style: 'Number' }],
          [{ value: 'Average Daily Faculty Footfall' }, { value: lib.dailyFacultyFootfall || 0, style: 'Number' }],
          [{ value: 'Average Daily Student Footfall' }, { value: lib.dailyStudentFootfall || 0, style: 'Number' }]
        ];

        wsList.push({
          name: 'Attribute III - Infrastructure',
          rows: [
            [{ value: `IQAC AAA 2026-2027: ${deptName}`, style: 'Title' }],
            ...eqRows,
            ...libRows
          ]
        });
        break;
      }

      case 'att4_7': {
        const att4_7 = data.attributeIV_VII || {};
        wsList.push({
          name: 'Attribute IV & VII - Grants',
          rows: [
            [{ value: `IQAC AAA 2026-2027: ${deptName}`, style: 'Title' }],
            [{ value: 'Attribute IV & VII: Grants, Management Funds & Seed Money', style: 'SubHeader' }],
            [],
            [{ value: 'Category', style: 'Header' }, { value: 'Funding Agency', style: 'Header' }, { value: 'Amount (INR)', style: 'Header' }, { value: 'Faculty Involved', style: 'Header' }],
            ...(att4_7.externalFunds || []).map(f => [
              { value: f.category || 'External Project' },
              { value: f.agency || '' },
              { value: Number(f.amountINR) || 0, style: 'Currency' },
              { value: f.facultyInvolved || '' }
            ]),
            ...(att4_7.managementFunds || []).map(m => [
              { value: 'Management Grant' },
              { value: m.purpose || '' },
              { value: Number(m.amountINR) || 0, style: 'Currency' },
              { value: m.facultyInvolved || '' }
            ]),
            [{ value: 'Seed Money Projects' }, { value: 'Management' }, { value: Number(att4_7.seedMoney?.amountSanctioned) || 0, style: 'Currency' }, { value: `Projects: ${att4_7.seedMoney?.projectsCount || 0}` }]
          ]
        });
        break;
      }

      case 'att5': {
        const att5 = data.attributeV || {};
        wsList.push({
          name: 'Attribute V - Teaching & MoUs',
          rows: [
            [{ value: `IQAC AAA 2026-2027: ${deptName}`, style: 'Title' }],
            [{ value: 'Attribute V: Teaching-Learning, MoUs & E-Contents', style: 'SubHeader' }],
            [],
            [{ value: 'Dimension', style: 'Header' }, { value: 'Count', style: 'Header' }, { value: 'Activities & Details', style: 'Header' }],
            [{ value: 'New MoUs Created (2026-2027)' }, { value: att5.mouCreated?.count || 0, style: 'Number' }, { value: att5.mouCreated?.activitiesConducted || '' }],
            [{ value: 'Previous Active MoUs' }, { value: att5.previousMous?.count || 0, style: 'Number' }, { value: att5.previousMous?.activitiesConducted || '' }],
            [{ value: 'Linkages Created (2026-2027)' }, { value: att5.linkages?.count || 0, style: 'Number' }, { value: att5.linkages?.activitiesConducted || '' }],
            [{ value: 'Four-Quadrant E-Contents' }, { value: att5.eContent?.count || 0, style: 'Number' }, { value: att5.eContent?.details || '' }]
          ]
        });
        break;
      }

      case 'att9': {
        const att9 = data.attributeIX || {};
        wsList.push({
          name: 'Attribute IX - Research & IPR',
          rows: [
            [{ value: `IQAC AAA 2026-2027: ${deptName}`, style: 'Title' }],
            [{ value: 'Attribute IX: Research, Publications, Patents & IPR', style: 'SubHeader' }],
            [],
            [{ value: 'Research Metric', style: 'Header' }, { value: 'Count', style: 'Header' }, { value: 'Specifics / Indexed Details', style: 'Header' }],
            [{ value: 'Ph.D. Degrees Conferred' }, { value: att9.phdConferred?.count || 0, style: 'Number' }, { value: `New Guides: ${att9.phdConferred?.newGuides || 0}, New Scholars: ${att9.phdConferred?.newScholars || 0}` }],
            [{ value: 'Papers Published in Scopus/WoS' }, { value: (att9.papersPublished?.scopus || 0) + (att9.papersPublished?.wos || 0), style: 'Number' }, { value: `Scopus: ${att9.papersPublished?.scopus || 0}, WoS: ${att9.papersPublished?.wos || 0}` }],
            [{ value: 'Papers Presented in Conferences' }, { value: (att9.conferencePresented?.indexed || 0) + (att9.conferencePresented?.nonIndexed || 0), style: 'Number' }, { value: `Indexed: ${att9.conferencePresented?.indexed || 0}` }],
            [{ value: 'Books & Chapters Contributed' }, { value: (att9.books?.published || 0) + (att9.books?.edited || 0) + (att9.books?.chapters || 0), style: 'Number' }, { value: `Books: ${att9.books?.published || 0}, Chapters: ${att9.books?.chapters || 0}` }],
            [{ value: 'Patents Applied & Granted' }, { value: (att9.patents?.applied || 0) + (att9.patents?.granted || 0), style: 'Number' }, { value: `Applied: ${att9.patents?.applied || 0}, Granted: ${att9.patents?.granted || 0}` }],
            [{ value: 'Open Educational Resources (OER)' }, { value: att9.oer?.count || 0, style: 'Number' }, { value: att9.oer?.details || '' }]
          ]
        });
        break;
      }

      case 'att10': {
        const att10 = data.attributeX || {};
        const csrList = att10.csrActivities || [];
        const sust = att10.sustainability || {};

        wsList.push({
          name: 'Attribute X - Values & CSR',
          rows: [
            [{ value: `IQAC AAA 2026-2027: ${deptName}`, style: 'Title' }],
            [{ value: '10.1 Extension & CSR Collaborations', style: 'SubHeader' }],
            [
              { value: '#', style: 'Header' },
              { value: 'Activity Title', style: 'Header' },
              { value: 'Type', style: 'Header' },
              { value: 'Collaborating Partner', style: 'Header' },
              { value: 'Beneficiaries', style: 'Header' },
              { value: 'Amount (INR)', style: 'Header' }
            ],
            ...csrList.map((c, i) => [
              { value: i + 1, style: 'Number' },
              { value: c.activityName || '' },
              { value: c.type || '' },
              { value: c.collaboratingAgency || '' },
              { value: c.studentsBenefited || 0, style: 'Number' },
              { value: Number(c.amountINR) || 0, style: 'Currency' }
            ]),
            [],
            [{ value: '10.2 Green Campus & Sustainability Initiatives', style: 'SubHeader' }],
            [{ value: 'Initiative Dimension', style: 'Header' }, { value: 'Department Practice', style: 'Header' }],
            [{ value: 'Paperless Internal Assessments (CIA)' }, { value: sust.paperlessCIA || '' }],
            [{ value: 'Solar & Renewable Energy Usage' }, { value: sust.solarEnergyUsage || '' }],
            [{ value: 'Plastic-Free Campus & Waste Protocol' }, { value: sust.plasticFreeCampus || '' }],
            [{ value: 'Rainwater Harvesting & Recharge Wells' }, { value: sust.rainwaterHarvesting || '' }]
          ]
        });
        break;
      }

      default: {
        // Fallback simple attribute export
        wsList.push({
          name: attrKey,
          rows: [
            [{ value: `IQAC AAA 2026-2027: ${deptName}`, style: 'Title' }],
            [{ value: `Attribute: ${attrKey}`, style: 'SubHeader' }],
            [{ value: 'Exported on', style: 'Header' }, { value: new Date().toLocaleString() }]
          ]
        });
      }
    }

    const xml = this.generateXmlWorkbook(wsList);
    this.downloadFile(xml, `${cleanDept}_${attrKey}_2026_2027.xls`);
  }

  // EXPORT COMPLETE DEPARTMENT WORKBOOK (ALL 10 ATTRIBUTES)
  static exportCompleteDepartmentToExcel(data, deptName = 'Department') {
    const cleanDept = deptName.replace(/[^a-zA-Z0-9]/g, '_');
    const sch = data.departmentInfo?.scholars || {};
    const att1 = data.attributeI || {};
    const att2 = data.attributeII || {};
    const att3 = data.attributeIII || {};
    const att4_7 = data.attributeIV_VII || {};
    const att5 = data.attributeV || {};
    const att6_8 = data.attributeVI_VIII || {};
    const outcomes = data.studentsOutcomes2026 || {};
    const att9 = data.attributeIX || {};
    const att10 = data.attributeX || {};
    const panel = data.panelReview || {};

    const worksheets = [
      // Sheet 1: Master Summary & Scholars
      {
        name: 'Master Profile & Scholars',
        rows: [
          [{ value: `St. Joseph's College (Autonomous) - Annual Academic Audit 2026-2027`, style: 'Title' }],
          [{ value: `Department: ${deptName}`, style: 'SubHeader' }],
          [{ value: `HOD: ${data.departmentInfo?.hodName || ''} | Estd: ${data.departmentInfo?.establishedYear || ''}`, style: 'SubHeader' }],
          [],
          [{ value: 'Research Scholars Matrix (Table 1)', style: 'SubHeader' }],
          [{ value: 'Type', style: 'Header' }, { value: 'Male', style: 'Header' }, { value: 'Female', style: 'Header' }, { value: 'Total', style: 'Header' }],
          [{ value: 'Full Time' }, { value: sch.fullTime?.male || 0, style: 'Number' }, { value: sch.fullTime?.female || 0, style: 'Number' }, { value: (sch.fullTime?.male || 0) + (sch.fullTime?.female || 0), style: 'Number' }],
          [{ value: 'Part Time' }, { value: sch.partTime?.male || 0, style: 'Number' }, { value: sch.partTime?.female || 0, style: 'Number' }, { value: (sch.partTime?.male || 0) + (sch.partTime?.female || 0), style: 'Number' }],
          [{ value: 'Total Scholars', style: 'SubHeader' }, { value: (sch.fullTime?.male || 0) + (sch.partTime?.male || 0), style: 'Number' }, { value: (sch.fullTime?.female || 0) + (sch.partTime?.female || 0), style: 'Number' }, { value: ((sch.fullTime?.male || 0) + (sch.fullTime?.female || 0) + (sch.partTime?.male || 0) + (sch.partTime?.female || 0)), style: 'Number' }],
          [],
          [{ value: 'Audit Grade Assigned:', style: 'SubHeader' }, { value: panel.overallGrade || 'A++', style: 'Header' }]
        ]
      },
      // Sheet 2: Attribute I
      {
        name: 'Att I - Curriculum & PTM',
        rows: [
          [{ value: 'Attribute I: Curriculum Design & MOOCs', style: 'Title' }],
          [{ value: 'Value Added Courses (VAC)', style: 'SubHeader' }],
          [{ value: 'Course', style: 'Header' }, { value: 'Enrolled', style: 'Header' }, { value: 'Fee Collected', style: 'Header' }, { value: 'Agency', style: 'Header' }],
          ...(att1.vac || []).map(v => [{ value: v.name }, { value: v.studentsEnrolled || 0, style: 'Number' }, { value: v.feeCollected || 0, style: 'Currency' }, { value: v.agenciesInvolved || '' }]),
          [],
          [{ value: 'Certificate Courses (CC)', style: 'SubHeader' }],
          [{ value: 'Course', style: 'Header' }, { value: 'Enrolled', style: 'Header' }, { value: 'Fee Collected', style: 'Header' }, { value: 'Agency', style: 'Header' }],
          ...(att1.cc || []).map(c => [{ value: c.name }, { value: c.studentsEnrolled || 0, style: 'Number' }, { value: c.feeCollected || 0, style: 'Currency' }, { value: c.agenciesInvolved || '' }]),
          [],
          [{ value: 'PTM Metrics', style: 'SubHeader' }],
          [{ value: 'Total PTMs Conducted' }, { value: att1.ptm?.ptmCount || 0, style: 'Number' }],
          [{ value: 'Total Parents Attended' }, { value: att1.ptm?.parentsAttended || 0, style: 'Number' }]
        ]
      },
      // Sheet 3: Attribute II
      {
        name: 'Att II - Faculty',
        rows: [
          [{ value: 'Attribute II: Faculty Resources & Development', style: 'Title' }],
          [{ value: 'Metric', style: 'Header' }, { value: 'Count', style: 'Header' }, { value: 'Details', style: 'Header' }],
          [{ value: 'New Degrees' }, { value: att2.newDegrees?.count || 0, style: 'Number' }, { value: att2.newDegrees?.details || '' }],
          [{ value: 'NET / SET Qualified' }, { value: att2.netSet?.count || 0, style: 'Number' }, { value: att2.netSet?.details || '' }],
          [{ value: 'BoS Members' }, { value: att2.recognizedBodies?.bos || 0, style: 'Number' }, { value: '' }],
          [{ value: 'Journal Reviewers' }, { value: att2.researchJournals?.reviewers || 0, style: 'Number' }, { value: '' }],
          [{ value: 'Journal Editors' }, { value: att2.researchJournals?.editors || 0, style: 'Number' }, { value: '' }],
          [{ value: 'FDPs Attended' }, { value: (att2.fdp?.mmttc || 0) + (att2.fdp?.otherInstitutions || 0), style: 'Number' }, { value: '' }],
          [{ value: 'Abroad Visits' }, { value: att2.abroadVisits?.count || 0, style: 'Number' }, { value: att2.abroadVisits?.facultyNames || '' }]
        ]
      },
      // Sheet 4: Attribute III
      {
        name: 'Att III - Infrastructure',
        rows: [
          [{ value: 'Attribute III: Infrastructure & Learning Resources', style: 'Title' }],
          [{ value: 'Laboratory Equipment Procured (2026-2027)', style: 'SubHeader' }],
          [{ value: 'Facility', style: 'Header' }, { value: 'Equipment', style: 'Header' }, { value: 'Type', style: 'Header' }, { value: 'Date', style: 'Header' }, { value: 'Cost (INR)', style: 'Header' }],
          ...(att3.purchasedEquipments || []).map(e => [{ value: e.labName }, { value: e.equipmentName }, { value: e.type }, { value: e.purchaseDate }, { value: Number(e.amountINR) || 0, style: 'Currency' }]),
          [],
          [{ value: 'Department Library Resources', style: 'SubHeader' }],
          [{ value: 'Indicator', style: 'Header' }, { value: 'Count', style: 'Header' }],
          [{ value: 'Total Books in Dept' }, { value: att3.departmentLibrary?.totalBooks || 0, style: 'Number' }],
          [{ value: 'Books Added in 2026-2027' }, { value: att3.departmentLibrary?.booksPurchased2026_2027 || 0, style: 'Number' }],
          [{ value: 'Total Journals' }, { value: att3.departmentLibrary?.totalJournals || 0, style: 'Number' }],
          [{ value: 'Daily Faculty Footfall' }, { value: att3.departmentLibrary?.dailyFacultyFootfall || 0, style: 'Number' }],
          [{ value: 'Daily Student Footfall' }, { value: att3.departmentLibrary?.dailyStudentFootfall || 0, style: 'Number' }]
        ]
      },
      // Sheet 5: Attribute IV & VII
      {
        name: 'Att IV & VII - Grants',
        rows: [
          [{ value: 'Attribute IV & VII: External Grants & Seed Money', style: 'Title' }],
          [{ value: 'Category', style: 'Header' }, { value: 'Agency / Source', style: 'Header' }, { value: 'Amount (INR)', style: 'Header' }, { value: 'Faculty', style: 'Header' }],
          ...(att4_7.externalFunds || []).map(f => [{ value: f.category }, { value: f.agency }, { value: Number(f.amountINR) || 0, style: 'Currency' }, { value: f.facultyInvolved }]),
          ...(att4_7.managementFunds || []).map(m => [{ value: 'Management Grant' }, { value: m.purpose }, { value: Number(m.amountINR) || 0, style: 'Currency' }, { value: m.facultyInvolved }]),
          [{ value: 'Seed Money' }, { value: 'Management' }, { value: Number(att4_7.seedMoney?.amountSanctioned) || 0, style: 'Currency' }, { value: `Count: ${att4_7.seedMoney?.projectsCount || 0}` }]
        ]
      },
      // Sheet 6: Attribute V
      {
        name: 'Att V - Teaching & MoUs',
        rows: [
          [{ value: 'Attribute V: Teaching-Learning, MoUs & E-Contents', style: 'Title' }],
          [{ value: 'Dimension', style: 'Header' }, { value: 'Count', style: 'Header' }, { value: 'Activities', style: 'Header' }],
          [{ value: 'New MoUs Created' }, { value: att5.mouCreated?.count || 0, style: 'Number' }, { value: att5.mouCreated?.activitiesConducted || '' }],
          [{ value: 'Previous Active MoUs' }, { value: att5.previousMous?.count || 0, style: 'Number' }, { value: att5.previousMous?.activitiesConducted || '' }],
          [{ value: 'Linkages Created' }, { value: att5.linkages?.count || 0, style: 'Number' }, { value: att5.linkages?.activitiesConducted || '' }],
          [{ value: '4-Quadrant E-Contents' }, { value: att5.eContent?.count || 0, style: 'Number' }, { value: att5.eContent?.details || '' }]
        ]
      },
      // Sheet 7: Attribute VI & VIII & Outcomes
      {
        name: 'Att VI, VIII & Outcomes',
        rows: [
          [{ value: 'Extended Curricular Engagements & Student Outcomes', style: 'Title' }],
          [{ value: 'Departmental Clubs (Attribute VI)', style: 'SubHeader' }],
          [{ value: 'Club Name', style: 'Header' }, { value: 'UG Students', style: 'Header' }, { value: 'PG Students', style: 'Header' }, { value: 'Activities', style: 'Header' }],
          ...(att6_8.clubs || []).map(c => [{ value: c.clubName }, { value: c.studentsUG || 0, style: 'Number' }, { value: c.studentsPG || 0, style: 'Number' }, { value: c.activities || '' }]),
          [],
          [{ value: 'Table 10: Student Outcomes (Passing Out Batch 2026)', style: 'SubHeader' }],
          [{ value: 'Programme', style: 'Header' }, { value: 'Strength', style: 'Header' }, { value: 'On-Campus', style: 'Header' }, { value: 'Off-Campus', style: 'Header' }, { value: 'Higher Studies', style: 'Header' }, { value: 'Entrepreneurs', style: 'Header' }],
          [{ value: 'UG' }, { value: outcomes.ug?.strength || 0, style: 'Number' }, { value: outcomes.ug?.onCampus || 0, style: 'Number' }, { value: outcomes.ug?.offCampus || 0, style: 'Number' }, { value: outcomes.ug?.higherStudies || 0, style: 'Number' }, { value: outcomes.ug?.entrepreneur || 0, style: 'Number' }],
          [{ value: 'PG' }, { value: outcomes.pg?.strength || 0, style: 'Number' }, { value: outcomes.pg?.onCampus || 0, style: 'Number' }, { value: outcomes.pg?.offCampus || 0, style: 'Number' }, { value: outcomes.pg?.higherStudies || 0, style: 'Number' }, { value: outcomes.pg?.entrepreneur || 0, style: 'Number' }]
        ]
      },
      // Sheet 8: Attribute IX
      {
        name: 'Att IX - Research & IPR',
        rows: [
          [{ value: 'Attribute IX: Research, Publications, Patents & IPR', style: 'Title' }],
          [{ value: 'Metric', style: 'Header' }, { value: 'Count', style: 'Header' }, { value: 'Details', style: 'Header' }],
          [{ value: 'Ph.D. Conferred' }, { value: att9.phdConferred?.count || 0, style: 'Number' }, { value: `New Guides: ${att9.phdConferred?.newGuides || 0}` }],
          [{ value: 'Scopus Publications' }, { value: att9.papersPublished?.scopus || 0, style: 'Number' }, { value: '' }],
          [{ value: 'WoS Publications' }, { value: att9.papersPublished?.wos || 0, style: 'Number' }, { value: '' }],
          [{ value: 'Conference Papers (Indexed)' }, { value: att9.conferencePresented?.indexed || 0, style: 'Number' }, { value: '' }],
          [{ value: 'Books Published' }, { value: att9.books?.published || 0, style: 'Number' }, { value: '' }],
          [{ value: 'Book Chapters' }, { value: att9.books?.chapters || 0, style: 'Number' }, { value: '' }],
          [{ value: 'Patents Applied' }, { value: att9.patents?.applied || 0, style: 'Number' }, { value: '' }],
          [{ value: 'Patents Granted' }, { value: att9.patents?.granted || 0, style: 'Number' }, { value: '' }],
          [{ value: 'OER Created' }, { value: att9.oer?.count || 0, style: 'Number' }, { value: att9.oer?.details || '' }]
        ]
      },
      // Sheet 9: Attribute X
      {
        name: 'Att X - Values & CSR',
        rows: [
          [{ value: 'Attribute X: Institutional Values, Green Initiatives & CSR Extension', style: 'Title' }],
          [{ value: 'CSR & Extension Outreach Projects', style: 'SubHeader' }],
          [{ value: 'Activity Title', style: 'Header' }, { value: 'Type', style: 'Header' }, { value: 'Collaborating Partner', style: 'Header' }, { value: 'Beneficiaries', style: 'Header' }, { value: 'Funding (INR)', style: 'Header' }],
          ...(att10.csrActivities || []).map(c => [{ value: c.activityName }, { value: c.type }, { value: c.collaboratingAgency }, { value: c.studentsBenefited || 0, style: 'Number' }, { value: Number(c.amountINR) || 0, style: 'Currency' }]),
          [],
          [{ value: 'Green Campus & Sustainability Practices', style: 'SubHeader' }],
          [{ value: 'Dimension', style: 'Header' }, { value: 'Status / Practice', style: 'Header' }],
          [{ value: 'Paperless CIA' }, { value: att10.sustainability?.paperlessCIA || '' }],
          [{ value: 'Solar Energy Usage' }, { value: att10.sustainability?.solarEnergyUsage || '' }],
          [{ value: 'Plastic-Free Campus' }, { value: att10.sustainability?.plasticFreeCampus || '' }],
          [{ value: 'Rainwater Harvesting' }, { value: att10.sustainability?.rainwaterHarvesting || '' }]
        ]
      }
    ];

    const xml = this.generateXmlWorkbook(worksheets);
    this.downloadFile(xml, `${cleanDept}_Complete_AAA_Dossier_2026_2027.xls`);
  }

  // EXPORT FACULTY DIRECTORY TO EXCEL
  static exportFacultyListToExcel(facultyList) {
    const rows = [
      [{ value: `St. Joseph's College (Autonomous) - IQAC AAA 2026-2027`, style: 'Title' }],
      [{ value: `Faculty-Wise Academic & Research Contributions Directory`, style: 'SubHeader' }],
      [{ value: `Exported on: ${new Date().toLocaleString()}`, style: 'SubHeader' }],
      [],
      [
        { value: '#', style: 'Header' },
        { value: 'Faculty Name', style: 'Header' },
        { value: 'Department', style: 'Header' },
        { value: 'Designation / Qualification', style: 'Header' },
        { value: 'Scopus/WoS Papers', style: 'Header' },
        { value: 'Grants Mobilized (INR)', style: 'Header' },
        { value: 'Patents', style: 'Header' },
        { value: 'Books/Chapters', style: 'Header' },
        { value: 'Journal Review/Editor', style: 'Header' },
        { value: 'Key Roles & Contributions', style: 'Header' }
      ]
    ];

    facultyList.forEach((fac, idx) => {
      rows.push([
        { value: idx + 1, style: 'Number' },
        { value: fac.name || '' },
        { value: fac.department || '' },
        { value: fac.designation || fac.qualification || '' },
        { value: Number(fac.publications) || 0, style: 'Number' },
        { value: Number(fac.grantsINR) || 0, style: 'Currency' },
        { value: Number(fac.patents) || 0, style: 'Number' },
        { value: Number(fac.books) || 0, style: 'Number' },
        { value: fac.editorialRoles || 'None' },
        { value: fac.contributions || '' }
      ]);
    });

    const xml = this.generateXmlWorkbook([{ name: 'Faculty Contributions', rows }]);
    this.downloadFile(xml, `IQAC_Faculty_Contributions_Directory_2026_2027.xls`);
  }

  // EXPORT AAA FEBRUARY 2027 ATTRIBUTE 1 WORKBOOK (12 SHEETS MATCHING EXCEL TEMPLATE)
  static exportCardWorkbook(cardData, schema, deptName = 'Department') {
    return this.exportAttribute1Workbook(cardData, schema, deptName);
  }

  static exportAttribute1Workbook(attribute1Data, schema, deptName = 'Department') {
    if (!schema || !Array.isArray(schema)) {
      schema = window.DEFAULT_ATTRIBUTE1_SCHEMA || [];
    }
    const data = attribute1Data || {};
    const worksheets = [];

    schema.forEach(sheet => {
      const sheetKey = sheet.key;
      const sData = data[sheetKey];
      const rows = [];

      // Title & Subtitle
      rows.push([{ value: sheet.title || sheetKey, style: 'Title' }]);
      if (sheet.subtitle || sheet.instruction || sheet.note) {
        rows.push([{ value: [sheet.subtitle, sheet.instruction, sheet.note].filter(Boolean).join(' | '), style: 'SubHeader' }]);
      }
      rows.push([{ value: `Department: ${deptName} | Generated: ${new Date().toLocaleDateString()}`, style: 'SubHeader' }]);
      rows.push([]);

      if (sheet.type === 'profile') {
        const prof = (sData && sData.profile) ? sData.profile : (sheet.profileQuestions || {});
        rows.push([{ value: 'Department Profile', style: 'Header' }, { value: prof.department || deptName, style: 'Cell' }]);
        rows.push([{ value: 'Shift', style: 'Header' }, { value: prof.shift || 'Shift I', style: 'Cell' }]);
        rows.push([{ value: 'Programmes Offered - UG', style: 'Header' }, { value: prof.programmes?.ug || '', style: 'Cell' }]);
        rows.push([{ value: 'Programmes Offered - PG', style: 'Header' }, { value: prof.programmes?.pg || '', style: 'Cell' }]);
        rows.push([{ value: 'Programmes Offered - PhD', style: 'Header' }, { value: prof.programmes?.phd || '', style: 'Cell' }]);
        rows.push([{ value: 'Head of Department / Coordinator', style: 'Header' }, { value: prof.hodName || '', style: 'Cell' }]);
        rows.push([]);

        // Faculty details
        rows.push([{ value: 'Faculty Details', style: 'SubHeader' }]);
        const facHeaders = sheet.facultyDetails?.headers || ['Faculty Category', 'Male', 'Female'];
        rows.push([...facHeaders.map(h => ({ value: h, style: 'Header' })), { value: 'Total', style: 'Header' }]);
        const facRows = (sData && sData.facultyDetails) ? sData.facultyDetails : (sheet.facultyDetails?.rows || []);
        facRows.forEach(fr => {
          const m = Number(fr.male) || 0;
          const f = Number(fr.female) || 0;
          rows.push([
            { value: fr.label || '', style: 'Cell' },
            { value: m, style: 'Number' },
            { value: f, style: 'Number' },
            { value: m + f, style: 'Number' }
          ]);
        });
        rows.push([]);

        // Student details
        rows.push([{ value: 'Student Details', style: 'SubHeader' }]);
        const stuHeaders = sheet.studentDetails?.headers || ['Programme Level', 'Male', 'Female', 'Other Gender', 'Other States', 'Other Countries'];
        rows.push([...stuHeaders.map(h => ({ value: h, style: 'Header' })), { value: 'Total', style: 'Header' }]);
        const stuRows = (sData && sData.studentDetails) ? sData.studentDetails : (sheet.studentDetails?.rows || []);
        stuRows.forEach(sr => {
          const m = Number(sr.male) || 0;
          const f = Number(sr.female) || 0;
          const og = Number(sr.otherGender) || 0;
          const os = Number(sr.otherStates) || 0;
          const oc = Number(sr.otherCountries) || 0;
          rows.push([
            { value: sr.programme || '', style: 'Cell' },
            { value: m, style: 'Number' },
            { value: f, style: 'Number' },
            { value: og, style: 'Number' },
            { value: os, style: 'Number' },
            { value: oc, style: 'Number' },
            { value: m + f + og, style: 'Number' }
          ]);
        });

      } else if (sheet.type === 'table') {
        const cols = sheet.columns || [];
        rows.push(cols.map(c => ({ value: c.label, style: 'Header' })));
        const tableRows = Array.isArray(sData) ? sData : (sheet.rows || []);
        tableRows.forEach(tr => {
          rows.push(cols.map(c => ({
            value: tr[c.key] !== undefined ? tr[c.key] : '',
            style: typeof tr[c.key] === 'number' ? 'Number' : 'Cell'
          })));
        });

      } else if (sheet.type === 'multi_table') {
        (sheet.sections || []).forEach((sec, idx) => {
          if (idx > 0) rows.push([]);
          rows.push([{ value: sec.title, style: 'SubHeader' }]);
          const cols = sec.columns || [];
          rows.push(cols.map(c => ({ value: c.label, style: 'Header' })));
          const secRows = (sData && sData[sec.id]) ? sData[sec.id] : (sec.rows || []);
          secRows.forEach(tr => {
            rows.push(cols.map(c => ({
              value: tr[c.key] !== undefined ? tr[c.key] : '',
              style: typeof tr[c.key] === 'number' ? 'Number' : 'Cell'
            })));
          });
        });

      } else if (sheet.type === 'batch_table') {
        const cols = sheet.columns || [];
        (sheet.batches || []).forEach((bat, idx) => {
          if (idx > 0) rows.push([]);
          rows.push([{ value: bat.name, style: 'SubHeader' }]);
          rows.push(cols.map(c => ({ value: c.label, style: 'Header' })));
          const batRows = (sData && sData[bat.id]) ? sData[bat.id] : (bat.rows || []);
          batRows.forEach(tr => {
            rows.push(cols.map(c => ({
              value: tr[c.key] !== undefined ? tr[c.key] : '',
              style: typeof tr[c.key] === 'number' ? 'Number' : 'Cell'
            })));
          });
        });
      }

      worksheets.push({ name: sheet.sheetName || sheetKey, rows });
    });

    const xml = this.generateXmlWorkbook(worksheets);
    this.downloadFile(xml, `AAA_February_2027_Attribute_1_${deptName.replace(/[^a-zA-Z0-9]/g, '_')}.xls`);
  }


  // EXPORT CROSS-DEPARTMENT COMPARISON TO EXCEL
  static exportComparisonMatrixToExcel(attributeTitle, columns, matrixData) {
    const rows = [
      [{ value: `St. Joseph's College (Autonomous) - IQAC AAA 2026-2027`, style: 'Title' }],
      [{ value: `Comparative Departmental Matrix: ${attributeTitle}`, style: 'SubHeader' }],
      [{ value: `Generated on: ${new Date().toLocaleString()}`, style: 'SubHeader' }],
      [],
      columns.map(c => ({ value: c, style: 'Header' }))
    ];

    matrixData.forEach(row => {
      rows.push(row.map(val => ({
        value: val,
        style: typeof val === 'number' ? 'Number' : 'Cell'
      })));
    });

    const xml = this.generateXmlWorkbook([{ name: 'Department Comparison', rows }]);
    this.downloadFile(xml, `IQAC_Department_Comparison_${attributeTitle.replace(/[^a-zA-Z0-9]/g, '_')}.xls`);
  }
}

window.ExcelExporter = ExcelExporter;
window.excelExporter = ExcelExporter;
