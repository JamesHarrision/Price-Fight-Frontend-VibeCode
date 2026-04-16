import React from 'react';
import { ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';

export const TrustSignals = () => {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center divide-x divide-gray-100 text-center">
          <div className="p-6 flex-1 min-w-[200px]">
            <ShieldCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-black text-gray-900 text-sm">100% Chính Hãng</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Người Bán Uy Tín</p>
          </div>
          <div className="p-6 flex-1 min-w-[200px]">
            <Zap className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="font-black text-gray-900 text-sm">Đấu Giá Trực Tiếp</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Độ Trễ Thấp</p>
          </div>
          <div className="p-6 flex-1 min-w-[200px]">
            <CheckCircle2 className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <h4 className="font-black text-gray-900 text-sm">Thanh Toán An Toàn</h4>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Giao Dịch Đảm Bảo</p>
          </div>
        </div>
      </div>
    </div>
  );
};
