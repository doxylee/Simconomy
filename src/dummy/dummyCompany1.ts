import { Company } from "@core/packages/company/Company";
import { BN } from "@core/common/BigNumber";

export const dummyCompany1 = new Company({name:"dummyCompany1", cash:BN(10_000_000)});
