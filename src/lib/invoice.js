import { formatPrice } from './utils';

export const printInvoice = (order) => {
  const date = order.createdAt?.toDate 
    ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString();

  const invoiceHTML = `
    <html>
      <head>
        <title>Invoice #${order.id.slice(0, 8)}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #B08D55; text-transform: uppercase; letter-spacing: 2px; }
          .invoice-details { text-align: right; }
          .bill-to { margin-bottom: 30px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th { text-align: left; padding: 12px; background: #f9f9f9; border-bottom: 1px solid #ddd; font-size: 12px; text-transform: uppercase; color: #666; }
          .table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
          .total-section { float: right; width: 300px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; }
          .grand-total { border-top: 2px solid #333; font-weight: bold; font-size: 16px; margin-top: 10px; padding-top: 10px; }
          .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Pahnawa Banaras</div>
            <p style="font-size: 12px; color: #666; margin-top: 5px;">Authentic Handloom, Varanasi</p>
          </div>
          <div class="invoice-details">
            <h1 style="margin: 0; font-size: 20px;">INVOICE</h1>
            <p style="margin: 5px 0; color: #666;">#${order.id.slice(0, 8).toUpperCase()}</p>
            <p style="margin: 5px 0; color: #666;">Date: ${date}</p>
          </div>
        </div>

        <div class="bill-to">
          <strong style="font-size: 12px; text-transform: uppercase; color: #999;">Bill To:</strong>
          <p style="margin: 5px 0; font-weight: bold;">${order.shippingDetails?.firstName} ${order.shippingDetails?.lastName}</p>
          <p style="margin: 2px 0;">${order.shippingDetails?.address}</p>
          <p style="margin: 2px 0;">${order.shippingDetails?.city}, ${order.shippingDetails?.state} - ${order.shippingDetails?.pincode}</p>
          <p style="margin: 2px 0;">Ph: ${order.shippingDetails?.phone}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>
                  <strong>${item.name}</strong>
                  ${item.options?.fallPico ? '<br/><span style="font-size:10px; color:#666;">+ Fall/Pico</span>' : ''}
                </td>
                <td>${item.quantity}</td>
                <td>₹${formatPrice(item.price)}</td>
                <td style="text-align: right;">₹${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="row"><span>Subtotal:</span> <span>₹${formatPrice(order.totalAmount)}</span></div>
          <div class="row"><span>Shipping:</span> <span style="color: green;">Free</span></div>
          <div class="row grand-total"><span>Total Paid:</span> <span>₹${formatPrice(order.totalAmount)}</span></div>
          <div class="row"><span style="font-size: 12px; color: #666;">Paid via: ${order.paymentMethod === 'cod' ? 'Cash' : 'Online'}</span></div>
        </div>

        <div style="clear: both;"></div>

        <div class="footer">
          <p>Thank you for shopping with Pahnawa Banaras.</p>
          <p>For support: support@pahnawabanaras.com</p>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
};