(function () {
  'use strict';
  // 仅写一个工作表的本地 OOXML 导出器。ZIP 使用 STORE，无 CDN、无请求。
  // 所有单元格都是 inlineStr，文本不会被 Excel 当作公式执行。
  var encoder = new TextEncoder();
  var table = new Uint32Array(256);
  for (var n = 0; n < 256; n++) {
    var c = n;
    for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  function crc32(bytes) {
    var crc = 0xffffffff;
    bytes.forEach(function (byte) { crc = table[(crc ^ byte) & 255] ^ (crc >>> 8); });
    return (crc ^ 0xffffffff) >>> 0;
  }
  function xml(value) {
    return String(value == null ? '' : value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }
  function header(size) {
    var bytes = new Uint8Array(size);
    return { bytes: bytes, view: new DataView(bytes.buffer) };
  }
  function zip(files) {
    var chunks = [], directory = [], offset = 0, directorySize = 0;
    Object.keys(files).forEach(function (path) {
      var name = encoder.encode(path), data = encoder.encode(files[path]), crc = crc32(data);
      var local = header(30);
      local.view.setUint32(0, 0x04034b50, true);
      local.view.setUint16(4, 20, true);
      local.view.setUint16(12, 33, true); // 1980-01-01
      local.view.setUint32(14, crc, true);
      local.view.setUint32(18, data.length, true);
      local.view.setUint32(22, data.length, true);
      local.view.setUint16(26, name.length, true);
      chunks.push(local.bytes, name, data);
      var central = header(46);
      central.view.setUint32(0, 0x02014b50, true);
      central.view.setUint16(4, 20, true);
      central.view.setUint16(6, 20, true);
      central.view.setUint16(14, 33, true);
      central.view.setUint32(16, crc, true);
      central.view.setUint32(20, data.length, true);
      central.view.setUint32(24, data.length, true);
      central.view.setUint16(28, name.length, true);
      central.view.setUint32(42, offset, true);
      directory.push(central.bytes, name);
      offset += 30 + name.length + data.length;
      directorySize += 46 + name.length;
    });
    var end = header(22), count = Object.keys(files).length;
    end.view.setUint32(0, 0x06054b50, true);
    end.view.setUint16(8, count, true);
    end.view.setUint16(10, count, true);
    end.view.setUint32(12, directorySize, true);
    end.view.setUint32(16, offset, true);
    return new Blob(chunks.concat(directory, [end.bytes]), {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }
  function build(rows) {
    var ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
    var rel = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    var data = rows.map(function (row, i) {
      return '<row r="' + (i + 1) + '">' + row.map(function (value, j) {
        return '<c r="' + String.fromCharCode(65 + j) + (i + 1) + '" t="inlineStr" s="' + (i ? 0 : 1) +
          '"><is><t xml:space="preserve">' + xml(value) + '</t></is></c>';
      }).join('') + '</row>';
    }).join('');
    return zip({
      '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + rel + '/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml': '<workbook xmlns="' + ns + '" xmlns:r="' + rel + '"><sheets><sheet name="操作日志（模拟）" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + rel + '/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="' + rel + '/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml': '<styleSheet xmlns="' + ns + '"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
      'xl/worksheets/sheet1.xml': '<worksheet xmlns="' + ns + '"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="8" customWidth="1"/><col min="2" max="2" width="23" customWidth="1"/><col min="3" max="3" width="32" customWidth="1"/><col min="4" max="5" width="16" customWidth="1"/><col min="6" max="8" width="50" customWidth="1"/></cols><sheetData>' + data + '</sheetData><autoFilter ref="A1:H' + Math.max(1, rows.length) + '"/></worksheet>'
    });
  }
  window.__GAIP_OPERATION_LOG_XLSX__ = { build: build };
}());
