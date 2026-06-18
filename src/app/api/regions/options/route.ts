import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Region from "@/models/Region";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");
    const provinceCode = searchParams.get("provinceCode");
    const regencyCode = searchParams.get("regencyCode");
    const districtCode = searchParams.get("districtCode");

    const match: any = { isActive: true };
    
    // Build query based on provided parent codes
    if (provinceCode) match.provinceCode = provinceCode;
    if (regencyCode) match.regencyCode = regencyCode;
    if (districtCode) match.districtCode = districtCode;

    let group: any = null;
    let sort: any = { name: 1 };

    switch (level) {
      case "province":
        // Group by provinceCode
        group = {
          _id: "$provinceCode",
          code: { $first: "$provinceCode" },
          name: { $first: "$provinceName" }
        };
        break;
      case "regency":
        // Group by regencyCode
        if (!provinceCode) return NextResponse.json({ error: "provinceCode required" }, { status: 400 });
        group = {
          _id: "$regencyCode",
          code: { $first: "$regencyCode" },
          name: { $first: "$regencyName" }
        };
        break;
      case "district":
        // Group by districtCode
        if (!regencyCode) return NextResponse.json({ error: "regencyCode required" }, { status: 400 });
        group = {
          _id: "$districtCode",
          code: { $first: "$districtCode" },
          name: { $first: "$districtName" }
        };
        break;
      case "village":
        // Group by villageCode
        if (!districtCode) return NextResponse.json({ error: "districtCode required" }, { status: 400 });
        group = {
          _id: "$villageCode",
          code: { $first: "$villageCode" },
          name: { $first: "$villageName" }
        };
        break;
      default:
        return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const pipeline = [
      { $match: match },
      { $group: group },
      { $project: { _id: 0, code: 1, name: 1 } },
      { $sort: sort }
    ];

    const options = await Region.aggregate(pipeline);

    // Ensure valid entries (sometimes name might be null if legacy data)
    const validOptions = options.filter(opt => opt.code && opt.name);

    return NextResponse.json(validOptions);

  } catch (error) {
    console.error("Regions options API error:", error);
    return NextResponse.json({ error: "Failed to fetch region options" }, { status: 500 });
  }
}
