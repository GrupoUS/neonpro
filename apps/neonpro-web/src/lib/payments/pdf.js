"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePDFBlob = exports.generateInvoicePDF = exports.InvoicePDFDocument = void 0;
var renderer_1 = require("@react-pdf/renderer");
var react_1 = require("react");
// Register fonts (optional)
// Font.register({
//   family: 'Inter',
//   src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
// })
// PDF Styles
var styles = renderer_1.StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 12,
        paddingTop: 50,
        paddingHorizontal: 50,
        paddingBottom: 60,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#3b82f6',
        paddingBottom: 20,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    company: {
        textAlign: 'right',
        color: '#6b7280',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        margin: 10,
        padding: 10,
    },
    billToSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    billToBox: {
        width: '45%',
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 5,
    },
    text: {
        fontSize: 11,
        color: '#6b7280',
        marginBottom: 3,
    },
    table: {
        display: 'table',
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginTop: 20,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableColHeader: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        padding: 8,
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#e5e7eb',
        padding: 8,
    },
    tableCellHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
    },
    tableCell: {
        fontSize: 11,
        color: '#6b7280',
    },
    totalSection: {
        marginTop: 20,
        alignItems: 'flex-end',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 12,
        color: '#374151',
    },
    totalValue: {
        fontSize: 12,
        color: '#374151',
    },
    finalTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        borderTopWidth: 2,
        borderTopColor: '#3b82f6',
        paddingTop: 5,
        marginTop: 5,
    },
    finalTotalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    finalTotalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: 10,
    },
});
var InvoicePDFDocument = function (_a) {
    var data = _a.data;
    return (<renderer_1.Document>
    <renderer_1.Page size="A4" style={styles.page}>
      {/* Header */}
      <renderer_1.View style={styles.header}>
        <renderer_1.View>
          <renderer_1.Text style={styles.logo}>NeonPro</renderer_1.Text>
          <renderer_1.Text style={styles.text}>Clinic Management System</renderer_1.Text>
        </renderer_1.View>
        <renderer_1.View style={styles.company}>
          <renderer_1.Text style={styles.text}>{data.company.name}</renderer_1.Text>
          <renderer_1.Text style={styles.text}>{data.company.email}</renderer_1.Text>
          {data.company.phone && <renderer_1.Text style={styles.text}>{data.company.phone}</renderer_1.Text>}
          {data.company.address && <renderer_1.Text style={styles.text}>{data.company.address}</renderer_1.Text>}
        </renderer_1.View>
      </renderer_1.View>

      {/* Title */}
      <renderer_1.Text style={styles.title}>INVOICE #{data.invoiceNumber}</renderer_1.Text>

      {/* Invoice Info & Bill To */}
      <renderer_1.View style={styles.billToSection}>
        <renderer_1.View style={styles.billToBox}>
          <renderer_1.Text style={styles.label}>Invoice Information</renderer_1.Text>
          <renderer_1.Text style={styles.text}>Date: {data.invoiceDate}</renderer_1.Text>
          <renderer_1.Text style={styles.text}>Due Date: {data.dueDate}</renderer_1.Text>
          <renderer_1.Text style={styles.text}>Status: {data.status.toUpperCase()}</renderer_1.Text>
          {data.paymentTerms && <renderer_1.Text style={styles.text}>Terms: {data.paymentTerms}</renderer_1.Text>}
        </renderer_1.View>
        
        <renderer_1.View style={styles.billToBox}>
          <renderer_1.Text style={styles.label}>Bill To</renderer_1.Text>
          <renderer_1.Text style={styles.text}>{data.client.name}</renderer_1.Text>
          <renderer_1.Text style={styles.text}>{data.client.email}</renderer_1.Text>
          {data.client.phone && <renderer_1.Text style={styles.text}>{data.client.phone}</renderer_1.Text>}
          {data.client.address && <renderer_1.Text style={styles.text}>{data.client.address}</renderer_1.Text>}
        </renderer_1.View>
      </renderer_1.View>

      {/* Items Table */}
      <renderer_1.View style={styles.table}>
        {/* Table Header */}
        <renderer_1.View style={styles.tableRow}>
          <renderer_1.View style={styles.tableColHeader}>
            <renderer_1.Text style={styles.tableCellHeader}>Description</renderer_1.Text>
          </renderer_1.View>
          <renderer_1.View style={styles.tableColHeader}>
            <renderer_1.Text style={styles.tableCellHeader}>Quantity</renderer_1.Text>
          </renderer_1.View>
          <renderer_1.View style={styles.tableColHeader}>
            <renderer_1.Text style={styles.tableCellHeader}>Rate</renderer_1.Text>
          </renderer_1.View>
          <renderer_1.View style={styles.tableColHeader}>
            <renderer_1.Text style={styles.tableCellHeader}>Amount</renderer_1.Text>
          </renderer_1.View>
        </renderer_1.View>

        {/* Table Rows */}
        {data.items.map(function (item, index) { return (<renderer_1.View style={styles.tableRow} key={index}>
            <renderer_1.View style={styles.tableCol}>
              <renderer_1.Text style={styles.tableCell}>{item.description}</renderer_1.Text>
            </renderer_1.View>
            <renderer_1.View style={styles.tableCol}>
              <renderer_1.Text style={styles.tableCell}>{item.quantity}</renderer_1.Text>
            </renderer_1.View>
            <renderer_1.View style={styles.tableCol}>
              <renderer_1.Text style={styles.tableCell}>${item.rate.toFixed(2)}</renderer_1.Text>
            </renderer_1.View>
            <renderer_1.View style={styles.tableCol}>
              <renderer_1.Text style={styles.tableCell}>${item.amount.toFixed(2)}</renderer_1.Text>
            </renderer_1.View>
          </renderer_1.View>); })}
      </renderer_1.View>

      {/* Totals */}
      <renderer_1.View style={styles.totalSection}>
        <renderer_1.View style={styles.totalRow}>
          <renderer_1.Text style={styles.totalLabel}>Subtotal:</renderer_1.Text>
          <renderer_1.Text style={styles.totalValue}>${data.subtotal.toFixed(2)}</renderer_1.Text>
        </renderer_1.View>
        
        {data.tax > 0 && (<renderer_1.View style={styles.totalRow}>
            <renderer_1.Text style={styles.totalLabel}>Tax ({data.taxRate}%):</renderer_1.Text>
            <renderer_1.Text style={styles.totalValue}>${data.tax.toFixed(2)}</renderer_1.Text>
          </renderer_1.View>)}
        
        <renderer_1.View style={styles.finalTotal}>
          <renderer_1.Text style={styles.finalTotalLabel}>Total:</renderer_1.Text>
          <renderer_1.Text style={styles.finalTotalValue}>${data.total.toFixed(2)}</renderer_1.Text>
        </renderer_1.View>
      </renderer_1.View>

      {/* Notes */}
      {data.notes && (<renderer_1.View style={{ marginTop: 30 }}>
          <renderer_1.Text style={styles.label}>Notes:</renderer_1.Text>
          <renderer_1.Text style={styles.text}>{data.notes}</renderer_1.Text>
        </renderer_1.View>)}

      {/* Footer */}
      <renderer_1.Text style={styles.footer}>
        Thank you for your business! • NeonPro Clinic Management System
      </renderer_1.Text>
    </renderer_1.Page>
  </renderer_1.Document>);
};
exports.InvoicePDFDocument = InvoicePDFDocument;
// Generate PDF Buffer
var generateInvoicePDF = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var document, pdfBuffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                document = <exports.InvoicePDFDocument data={data}/>;
                return [4 /*yield*/, (0, renderer_1.pdf)(document).toBuffer()];
            case 1:
                pdfBuffer = _a.sent();
                return [2 /*return*/, pdfBuffer];
        }
    });
}); };
exports.generateInvoicePDF = generateInvoicePDF;
// Generate PDF Blob (for download)
var generateInvoicePDFBlob = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var document, pdfBlob;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                document = <exports.InvoicePDFDocument data={data}/>;
                return [4 /*yield*/, (0, renderer_1.pdf)(document).toBlob()];
            case 1:
                pdfBlob = _a.sent();
                return [2 /*return*/, pdfBlob];
        }
    });
}); };
exports.generateInvoicePDFBlob = generateInvoicePDFBlob;
