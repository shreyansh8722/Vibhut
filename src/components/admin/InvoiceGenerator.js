import { formatPrice } from '@/lib/utils'; // Assuming you have this helper, or remove it and use .toLocaleString()

export const printInvoice = (order) => {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert("Please allow popups to print invoices");
    return;
  }

  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; font-weight: 500;">${item.name} <br/> <span style="font-size: 12px; color: #666;">${item.selectedOptions?.size || 'Standard'}</span></td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">₹${item.price}</td>
      <td style="padding: 10px; text-align: right; font-weight: bold;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${order.id.slice(0, 8)}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; mx-auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #B08D55; text-transform: uppercase; }
          .invoice-details { text-align: right; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .box { background: #f9f9f9; padding: 20px; border-radius: 8px; }
          h3 { font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 10px 0; letter-spacing: 1px; }
          p { margin: 0; font-size: 14px; line-height: 1.6; }
          table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 10px; border-bottom: 2px solid #eee; font-size: 12px; text-transform: uppercase; }
          .totals { text-align: right; }
          .total-row { display: flex; justify-content: flex-end; gap: 40px; padding: 5px 0; }
          .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Pahnawa Banaras</div>
          <div class="invoice-details">
            <h1>INVOICE</h1>
            <p>#${order.id.slice(0, 8).toUpperCase()}</p>
            <p>Date: ${order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <h3>Bill To</h3>
            <p><strong>${order.shippingDetails?.firstName} ${order.shippingDetails?.lastName}</strong></p>
            <p>${order.shippingDetails?.address}</p>
            <p>${order.shippingDetails?.city}, ${order.shippingDetails?.state} - ${order.shippingDetails?.pincode}</p>
            <p>${order.shippingDetails?.phone}</p>
          </div>
          <div class="box">
             <h3>Ship To</h3>
             <p>Same as billing address</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row"><span>Subtotal:</span> <span>₹${order.totalAmount}</span></div>
          <div class="total-row"><span>Shipping:</span> <span>₹0.00</span></div>
          <div class="total-row grand-total"><span>Total:</span> <span>₹${order.totalAmount}</span></div>
        </div>

        <div style="margin-top: 50px; text-align: center; color: #999; font-size: 12px;">
          <p>Thank you for shopping with Pahnawa Banaras.</p>
          <p>For support, email hello@pahnawa.com</p>
        </div>
        
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};