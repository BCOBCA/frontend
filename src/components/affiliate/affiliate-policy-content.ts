import type { AffiliatePolicy, AffiliateRank } from '../../types/api';

export const unpublished = 'Chưa công bố';

export function policyDate(value: string | null | undefined): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return unpublished;
  const date = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return unpublished;
  return value.split('-').reverse().join('/');
}

export function policyPublication(policy: AffiliatePolicy | undefined, today: string): string {
  if (!policy) return 'Chưa xác minh tình trạng công bố';
  const { updatedOn, approvedOn, effectiveOn } = policy;
  if (policy.approvalStatus !== 'APPROVED' || !policy.version?.trim()
    || !updatedOn || !approvedOn || !effectiveOn
    || [updatedOn, approvedOn, effectiveOn].some(value => policyDate(value) === unpublished)
    || updatedOn > approvedOn || approvedOn > effectiveOn || approvedOn > today) return 'Dự thảo – chưa được công bố chính thức';
  return effectiveOn > today ? 'Đã phê duyệt – Chưa đến ngày hiệu lực' : 'Đã được phê duyệt';
}

export function policyTerms(policy?: AffiliatePolicy) {
  const days = (value: number | null | undefined) => value != null && Number.isInteger(value) && value >= 0 ? `${value} ngày` : unpublished;
  const amount = (value: number | null | undefined) => value != null && Number.isFinite(value) && value >= 0 ? `${value.toLocaleString('vi-VN')} VNĐ` : unpublished;
  return [
    { id: 'tracking', label: 'Thời gian lưu nguồn giới thiệu', value: days(policy?.attributionDays) },
    { id: 'hold', label: 'Thời gian chờ đủ điều kiện duyệt hoa hồng', value: days(policy?.approvalHoldDays) },
    { id: 'fee', label: 'Phí rút tiền', value: amount(policy?.withdrawalFee) },
    { id: 'minimum', label: 'Ngưỡng rút tiền tối thiểu', value: amount(policy?.minimumWithdrawal) },
    { id: 'payout', label: 'Thời gian thanh toán sau yêu cầu rút', value: policy?.paymentTime?.trim() || unpublished },
    { id: 'attribution', label: 'Quy tắc ưu tiên, quy thuộc đơn hàng', value: policy?.attributionRule?.trim() || unpublished },
    { id: 'complaint', label: 'Thời hạn tiếp nhận, trả lời khiếu nại', value: policy?.complaintResponseTime?.trim() || unpublished },
  ];
}

export function commissionExamples(ranks: readonly AffiliateRank[]) {
  const rank = [...ranks].sort((a, b) => a.rank - b.rank).find(item => Number.isFinite(item.commissionRate) && item.commissionRate >= 0 && item.commissionRate <= 1);
  if (!rank) return [];
  const rateUnits = Math.round(rank.commissionRate * 10000);
  return [100000, 500000, 1000000].map(base => ({ base, rankName: rank.name, rate: rank.commissionRate, amount: Math.round(base * 100 * rateUnits / 10000) / 100 }));
}

export const policySections = {
  scope: [
    'Chương trình Affiliate của Báo chí Online BCA cho phép người tham gia giới thiệu thành viên và chia sẻ liên kết sản phẩm. Việc có tài khoản, lượt nhấp hoặc đơn được tạo chưa tự động phát sinh quyền nhận hoa hồng.',
    'Phạm vi áp dụng gồm người tham gia có tài khoản hợp lệ, hoạt động giới thiệu trên nền tảng và sản phẩm được bật Affiliate. Chương trình không mặc nhiên áp dụng cho mọi sản phẩm, dịch vụ hoặc giao dịch ngoài hệ thống.',
    'Trang này trình bày cơ chế hiện có và nội dung điều khoản của chương trình. Điều khoản cần được đơn vị vận hành phê duyệt trước khi áp dụng chính thức; nội dung chưa phê duyệt không thay thế thỏa thuận đã có hiệu lực hoặc quy định pháp luật bắt buộc.',
  ],
  eligibility: [
    'Người tham gia sử dụng tài khoản đang hoạt động, cung cấp thông tin trung thực và bảo mật thông tin đăng nhập. Hồ sơ Affiliate phải khả dụng để tạo liên kết và truy cập ví.',
    'Việc tham gia, sử dụng hình ảnh hoặc giới thiệu sản phẩm phải phù hợp với năng lực giao dịch của người tham gia và quyền sử dụng nội dung. Không mạo danh người khác hoặc sử dụng thông tin không được phép.',
    'Điều kiện bổ sung về độ tuổi, hồ sơ xác minh, giấy tờ hoặc phí tham gia chưa có thông tin công bố tại đây. Không suy diễn việc đăng ký thành công là đã hoàn tất mọi điều kiện thanh toán.',
    'Khi rút tiền, cung cấp thông tin ngân hàng chính xác và số tiền hợp lệ trong phạm vi số dư khả dụng; khoản cần cấn trừ phải được xử lý theo kết quả đối soát.',
  ],
  memberReferral: [
    'Mã giới thiệu hoặc liên kết mời được lấy từ trang Thông tin Affiliate. Người được mời sử dụng mã hoặc liên kết khi đăng ký; lượt mời được gắn với tài khoản được giới thiệu mà hệ thống ghi nhận hợp lệ.',
    'Một lượt giới thiệu thành công được xác lập khi người được mời có đơn hàng đầu tiên hợp lệ, đã hoàn tất và đã thanh toán. Đơn mới tạo, chưa thanh toán, hủy, hoàn tiền hoặc giao dịch gian lận không đủ điều kiện.',
    'Mỗi người được mời chỉ được tính một lượt để xét hạng, dù mua nhiều lần hoặc đặt nhiều đơn. Lượt nhấp liên kết và số lượng đơn không thay thế số người được mời hợp lệ.',
  ],
  rankUpdates: [
    'Hạng được xác định từ tổng số người được mời đang đủ điều kiện và các ngưỡng trong bảng cấu hình. Khi đủ ngưỡng cao hơn, hệ thống xác định hạng tương ứng; số lượt tích lũy không đặt lại về 0.',
    'Thông tin hạng được tính lại khi truy vấn dữ liệu Affiliate hoặc khi hệ thống xác định hoa hồng. Không có cam kết về một lịch cập nhật cố định hoặc thời gian đồng bộ ngoài thông tin đã công bố.',
    'Nếu đơn đủ điều kiện bị hoàn tiền, hủy tính hợp lệ hoặc được xác định gian lận, lượt đó không đủ điều kiện xét hạng. Nếu người được mời vẫn còn đơn khác hợp lệ, họ vẫn chỉ được tính một lượt. Khi số lượt hợp lệ thay đổi, hạng có thể được điều chỉnh tương ứng.',
    'Hoa hồng đã ghi nhận lưu hạng và tỷ lệ tại thời điểm tính. Việc lên hạng sau đó không tự động làm tăng lại hoa hồng cũ; sai lệch hoặc hoàn tiền được xử lý theo đối soát và dữ liệu giao dịch.',
  ],
  commission: [
    'Lượt giới thiệu thành viên dùng để xét hạng; hoa hồng sản phẩm phụ thuộc nguồn giới thiệu được ghi nhận cho đơn, sản phẩm đủ điều kiện và giá trị từng dòng hàng. Lượt mời hoặc lượt nhấp không phải cam kết có thu nhập.',
    'Cơ sở tính là giá trị dòng sản phẩm hợp lệ sau phần giảm giá được phân bổ cho dòng đó; không bao gồm phí vận chuyển. Chỉ sản phẩm đang được bật Affiliate mới đủ điều kiện ghi nhận.',
    'Tỷ lệ áp dụng bằng tỷ lệ hạng tại thời điểm hệ thống ghi nhận, nhưng không vượt trần của sản phẩm nếu có. Ngân sách hoa hồng còn lại của sản phẩm có thể tiếp tục giới hạn số tiền; hết ngân sách hoặc bị tắt Affiliate có thể không phát sinh hoa hồng.',
    'Công thức: hoa hồng dự kiến = giá trị sản phẩm hợp lệ × tỷ lệ áp dụng. Số tiền được làm tròn đến hai chữ số thập phân theo cơ chế hệ thống, sau đó giới hạn bởi ngân sách sản phẩm còn lại nếu được cấu hình.',
  ],
  orders: [
    'Đơn phải được hệ thống ghi nhận nguồn giới thiệu hợp lệ, hoàn tất và đã thanh toán. Việc tạo giỏ, nhấp liên kết hoặc tạo đơn chưa đủ điều kiện tích lũy hoa hồng.',
    'Đơn có liên kết sản phẩm được ghi nhận chỉ tính các dòng hàng phù hợp với sản phẩm được giới thiệu. Không tự mua qua nguồn Affiliate của chính mình. Quy tắc ưu tiên giữa các nguồn được hiển thị theo thông tin công bố, không tự suy diễn từ lượt nhấp.',
    'Hoa hồng ban đầu được ghi vào số dư chờ duyệt. Hết thời gian chờ chỉ là một điều kiện để xem xét duyệt, không phải cam kết tự động duyệt hoặc đã chuyển tiền.',
    'Đơn đang có yêu cầu hoàn tiền thuộc diện kiểm tra không đủ điều kiện duyệt. Khi hoàn tiền được xác nhận, hoa hồng liên quan bị thu hồi; nếu đã duyệt hoặc đã chi, khoản cần thu hồi được ghi nhận để cấn trừ theo sổ giao dịch.',
    'Đơn gian lận hoặc nguồn không hợp lệ không được hưởng quyền lợi từ giao dịch đó. Việc xác định, thông báo và xử lý phải dựa trên chứng cứ và quy trình được phê duyệt; không mặc nhiên quy kết người tham gia khi chưa xác minh.',
  ],
  payment: [
    'Số dư chờ duyệt phản ánh hoa hồng chưa đủ điều kiện sử dụng. Số dư khả dụng là khoản có thể xem xét rút sau duyệt và cấn trừ. Khoản cần cấn trừ là nghĩa vụ điều chỉnh do hoa hồng bị thu hồi, không phải thu nhập mới.',
    'Gửi yêu cầu rút tại trang Ví & rút tiền, kiểm tra số dư, số tiền và thông tin ngân hàng trước khi xác nhận. Yêu cầu hợp lệ được giữ tiền khỏi số dư khả dụng để tránh rút lặp.',
    'Yêu cầu chuyển qua các trạng thái chờ xử lý, được duyệt, đã thanh toán hoặc bị từ chối. Chỉ ghi nhận đã thanh toán sau khi có xác nhận chuyển tiền thực tế; trạng thái được duyệt không đồng nghĩa tiền đã đến ngân hàng.',
    'Khi yêu cầu bị từ chối, tiền giữ được hoàn về ví và được xử lý cấn trừ nếu còn khoản phải thu hồi. Người tham gia kiểm tra lịch sử giao dịch và lịch sử rút để đối chiếu, không gửi nhiều yêu cầu cho cùng một sự cố.',
    'Phí, ngưỡng rút, thời gian chuyển tiền và việc khấu trừ nghĩa vụ tài chính chưa được công bố thì không được hiểu là miễn phí, không giới hạn hoặc có một thời gian xử lý mặc định. Nghĩa vụ thuế, nếu phát sinh, thực hiện theo pháp luật và thông tin hợp lệ do đơn vị vận hành cung cấp.',
  ],
  rights: [
    'Người tham gia có quyền xem mã mời, liên kết, hạng, tỷ lệ được cấu hình, lịch sử hoa hồng và giao dịch ví của mình; được đề nghị kiểm tra sai lệch và cung cấp chứng cứ bổ sung.',
    'Hoa hồng hợp lệ được xem xét ghi nhận, đối soát và thanh toán theo thỏa thuận có hiệu lực. Không có bảo đảm về mức thu nhập tối thiểu hoặc thu nhập cố định.',
    'Người tham gia chịu trách nhiệm về tính chính xác của nội dung giới thiệu, không cam kết thay nền tảng hoặc người bán về giá, công dụng, khuyến mại, hoàn tiền hay thu nhập khi chưa được cho phép.',
    'Tôn trọng dữ liệu cá nhân, bản quyền và quyền sở hữu trí tuệ; chỉ sử dụng dữ liệu và hình ảnh có quyền sử dụng. Không yêu cầu người mua cung cấp mật khẩu, mã xác thực hay thông tin tài khoản ngân hàng để ghi nhận giới thiệu.',
    'Theo dõi thông báo chính sách và lưu chứng từ cần thiết để đối soát. Các quyền bắt buộc theo pháp luật không bị loại bỏ chỉ vì tham gia chương trình.',
  ],
  prohibited: [
    'Nghiêm cấm tạo tài khoản giả, mạo danh, tự mua qua nguồn Affiliate của mình, dàn xếp đơn hàng hoặc đặt rồi hoàn/hủy có chủ đích để trục lợi.',
    'Không làm giả nguồn truy cập, thao túng mã giới thiệu, lợi dụng lỗi hệ thống, tự động tạo lượt hoặc can thiệp dữ liệu giao dịch trái phép.',
    'Không spam, quảng cáo gây nhầm lẫn, hứa hẹn thu nhập chắc chắn, giả danh kênh chính thức hoặc sử dụng nội dung vi phạm pháp luật và quyền của người khác.',
    'Giao dịch không hợp lệ không được tính lượt hoặc hoa hồng; khoản ghi nhận sai phải đối soát, điều chỉnh hoặc thu hồi theo chứng cứ. Các biện pháp hạn chế tham gia, tạm dừng xử lý hoặc chấm dứt chỉ áp dụng theo điều khoản đã được phê duyệt và pháp luật.',
    'Không tự đặt mức phạt tiền, thời hạn khóa tài khoản hoặc tước toàn bộ số dư. Người bị ảnh hưởng có quyền yêu cầu giải thích, gửi chứng cứ và khiếu nại kết quả xử lý.',
  ],
  disputes: [
    'Khi có sai lệch, gửi phản ánh qua mục Góp ý/hỗ trợ với mã đơn, mã liên kết, mã giao dịch, thời điểm và mô tả yêu cầu. Chỉ gửi dữ liệu cần thiết; không cung cấp mật khẩu hoặc mã xác thực.',
    'Đề nghị đơn vị vận hành kiểm tra nguồn giới thiệu, trạng thái đơn, hạng tại thời điểm tính và sổ giao dịch ví. Kết quả xử lý cần có căn cứ và nội dung phản hồi rõ ràng; thời hạn nội bộ chỉ áp dụng khi đã được công bố.',
    'Ưu tiên trao đổi và thương lượng thiện chí. Việc gửi phản ánh qua hệ thống không hạn chế quyền yêu cầu cơ quan có thẩm quyền giải quyết theo pháp luật áp dụng. Không mặc nhiên áp đặt trọng tài bắt buộc hoặc từ bỏ quyền khiếu nại.',
    'Thay đổi chính sách phải gắn với phiên bản, thông tin phê duyệt và ngày hiệu lực được công bố. Nội dung chưa phê duyệt không trở thành điều khoản chính thức chỉ vì được hiển thị; không mặc nhiên hồi tố hoặc suy diễn việc tiếp tục truy cập là đồng ý với mọi thay đổi.',
  ],
};

export function policyQuestions(policy?: AffiliatePolicy) {
  const terms = Object.fromEntries(policyTerms(policy).map(item => [item.id, item.value]));
  return [
    { id: 'join', question: 'Bắt đầu tham gia Affiliate như thế nào?', answer: 'Đăng nhập và mở Thông tin Affiliate để xem mã hoặc liên kết mời. Để chia sẻ sản phẩm, mở sản phẩm hỗ trợ chương trình và chọn “Tạo link Affiliate”. Kiểm tra điều kiện và trạng thái công bố chính sách trước khi tham gia.' },
    { id: 'difference', question: 'Mã mời thành viên khác liên kết sản phẩm thế nào?', answer: 'Mã hoặc link mời dùng để ghi nhận thành viên được giới thiệu và xét hạng. Link sản phẩm dùng để ghi nhận nguồn cho giao dịch mua sản phẩm đủ điều kiện. Lượt mời, lượt nhấp và đơn có hoa hồng là các chỉ số khác nhau.' },
    { id: 'qualified', question: 'Khi nào một lượt giới thiệu được tính thành công?', answer: 'Khi người được mời hoàn tất đơn hàng đầu tiên hợp lệ và đã thanh toán. Đơn tạo mới, hủy, hoàn tiền hoặc gian lận không đủ điều kiện.' },
    { id: 'once', question: 'Một người mua nhiều đơn có làm tăng nhiều lượt xét hạng không?', answer: 'Không. Mỗi người được mời chỉ tính một lượt, dù có nhiều đơn hàng hợp lệ. Số đơn đủ điều kiện hoa hồng được theo dõi riêng.' },
    { id: 'upgrade', question: 'Nâng hạng có bị đặt lại số lượt về 0 không?', answer: 'Không. Hệ thống giữ tổng số lượt hợp lệ để xét các ngưỡng tiếp theo. Việc hoàn tiền hoặc loại giao dịch không hợp lệ có thể làm số lượt và hạng thay đổi.' },
    { id: 'history', question: 'Lên hạng có được tính lại hoa hồng cũ không?', answer: 'Không tự động. Hoa hồng lưu hạng và tỷ lệ tại thời điểm ghi nhận; điều chỉnh sau đó phải có căn cứ đối soát, không suy diễn rằng mọi khoản cũ được hưởng tỷ lệ mới.' },
    { id: 'product', question: 'Vì sao tỷ lệ hạng cao nhưng hoa hồng sản phẩm thấp hơn?', answer: 'Sản phẩm có thể bị tắt Affiliate, áp dụng trần tỷ lệ hoặc giới hạn ngân sách còn lại. Phí vận chuyển không nằm trong cơ sở tính. Kiểm tra chi tiết sản phẩm và dòng hoa hồng đã ghi nhận.' },
    { id: 'tracking', question: 'Nguồn giới thiệu được lưu trong bao lâu?', answer: `Thời gian đang được cấu hình công khai: ${terms.tracking}. Lưu nguồn không bảo đảm mọi đơn đều có hoa hồng; nguồn, sản phẩm và đơn phải đáp ứng điều kiện.` },
    { id: 'priority', question: 'Người mua bấm nhiều link thì hoa hồng thuộc về ai?', answer: `Quy tắc ưu tiên và quy thuộc được công bố: ${terms.attribution}. Không tự suy luận rằng link đầu hoặc cuối luôn được hưởng. Khi có tranh chấp, cung cấp mã liên kết và mã đơn để kiểm tra nguồn hệ thống ghi nhận.` },
    { id: 'pending', question: 'Hết thời gian chờ là được trả tiền ngay phải không?', answer: `Không. Thời gian chờ đủ điều kiện duyệt: ${terms.hold}. Khoản chờ duyệt vẫn cần kiểm tra và phê duyệt; chỉ số dư khả dụng mới có thể được xem xét rút. Đây không phải thời gian cam kết thanh toán.` },
    { id: 'payout', question: 'Rút tối thiểu bao nhiêu, mất phí và chờ bao lâu?', answer: `Ngưỡng rút tối thiểu: ${terms.minimum}. Phí rút: ${terms.fee}. Thời gian thanh toán: ${terms.payout}. “Chưa công bố” không đồng nghĩa với miễn phí hoặc chi ngay.` },
    { id: 'refund', question: 'Nếu đã rút tiền rồi đơn hàng bị hoàn thì sao?', answer: 'Hoa hồng liên quan bị thu hồi theo kết quả hoàn tiền. Nếu số dư không đủ, hệ thống ghi nhận khoản cần cấn trừ và xử lý ở các khoản được duyệt sau; kiểm tra lịch sử ví và liên hệ hỗ trợ khi có sai lệch.' },
    { id: 'self', question: 'Tự mua qua link của mình có được hoa hồng không?', answer: 'Không. Tự giới thiệu sản phẩm cho chính mình không đủ điều kiện. Tạo tài khoản giả hoặc dàn xếp đơn để lách điều kiện cũng không được chấp nhận.' },
    { id: 'complaint', question: 'Liên hệ ở đâu khi thiếu lượt hoặc hoa hồng?', answer: `Gửi phản ánh qua Góp ý/hỗ trợ, kèm mã đơn, mã liên kết, thời điểm và chứng cứ phù hợp.${policy?.complaintEmail ? ` Email tiếp nhận được cấu hình: ${policy.complaintEmail}.` : ' Email tiếp nhận: Chưa công bố.'} Thời hạn phản hồi nội bộ: ${terms.complaint}. Quyền yêu cầu giải quyết theo pháp luật được bảo lưu.` },
  ];
}
