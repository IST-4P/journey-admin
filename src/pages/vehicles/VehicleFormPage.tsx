import { ArrowLeft, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import * as vehicleService from "../../lib/services/vehicle.service";
import type { Brand, Model } from "../../lib/types/vehicle.types";

interface VehicleFormData {
  type: "CAR" | "MOTORCYCLE";
  name: string;
  brandId: string;
  modelId: string;
  licensePlate: string;
  seats: number;
  fuelType: "GASOLINE" | "UNLEADED_GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID";
  transmission: "AUTOMATIC" | "MANUAL";
  pricePerHour: number;
  pricePerDay: number;
  location: string;
  city: string;
  ward: string;
  latitude: number;
  longitude: number;
  description: string;
  terms: string[];
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "RESERVED" | "RENTED";
  images: string[];
  featureIds: string[];
}

const initialFormData: VehicleFormData = {
  type: "CAR",
  name: "",
  brandId: "",
  modelId: "",
  licensePlate: "",
  seats: 5,
  fuelType: "GASOLINE",
  transmission: "AUTOMATIC",
  pricePerHour: 0,
  pricePerDay: 0,
  location: "",
  city: "",
  ward: "",
  latitude: 0,
  longitude: 0,
  description: "",
  terms: [],
  status: "ACTIVE",
  images: [],
  featureIds: [],
};

interface FeatureDisplay {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export function VehicleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [termInput, setTermInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Brands, Models and Features
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [features, setFeatures] = useState<FeatureDisplay[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);

  // Feature form
  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: "",
    description: "",
    icon: "",
  });

  // Fetch all brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const data = await vehicleService.getAllBrands();
        setBrands(data.brands as Brand[]);
      } catch (error) {
        console.error("Error fetching brands:", error);
        toast.error("Không thể tải danh sách hãng xe");
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // Fetch models when brandId changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!formData.brandId) {
        setModels([]);
        return;
      }

      try {
        setLoadingModels(true);
        const data = await vehicleService.getAllModels({
          brandId: formData.brandId,
        });
        setModels(data.models as Model[]);
      } catch (error) {
        console.error("Error fetching models:", error);
        toast.error("Không thể tải danh sách mẫu xe");
      } finally {
        setLoadingModels(false);
      }
    };

    fetchModels();
  }, [formData.brandId]);

  // Fetch features on mount
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setLoadingFeatures(true);
        const data = await vehicleService.getAllFeatures();
        setFeatures(data.features as FeatureDisplay[]);
      } catch (error) {
        toast.error("Không thể tải danh sách tính năng");
        console.error("Error fetching features:", error);
      } finally {
        setLoadingFeatures(false);
      }
    };
    fetchFeatures();
  }, []);

  // Load vehicle data when editing
  useEffect(() => {
    if (!isNew && id) {
      // TODO: Fetch vehicle data from API
      // const vehicle = await vehicleService.getVehicle(id);
      // setFormData(vehicle);
    }
  }, [isNew, id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      images: imageUrls,
    };
    console.log(`${isNew ? "Create" : "Update"} vehicle data:`, submitData);
    navigate("/vehicles");
  };

  const handleAddTerm = () => {
    if (termInput.trim() && !formData.terms.includes(termInput.trim())) {
      setFormData({
        ...formData,
        terms: [...formData.terms, termInput.trim()],
      });
      setTermInput("");
    }
  };

  const handleRemoveTerm = (term: string) => {
    setFormData({
      ...formData,
      terms: formData.terms.filter((t) => t !== term),
    });
  };

  const toggleFeature = (featureId: string) => {
    setFormData({
      ...formData,
      featureIds: formData.featureIds.includes(featureId)
        ? formData.featureIds.filter((f) => f !== featureId)
        : [...formData.featureIds, featureId],
    });
  };

  const handleCreateFeature = async () => {
    if (
      !newFeature.name.trim() ||
      !newFeature.description.trim() ||
      !newFeature.icon.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin tính năng");
      return;
    }

    try {
      await vehicleService.createFeature(newFeature);
      toast.success("Thêm tính năng thành công");

      // Refresh features list
      const data = await vehicleService.getAllFeatures();
      setFeatures(data.features as FeatureDisplay[]);

      // Reset form
      setNewFeature({ name: "", description: "", icon: "" });
      setShowFeatureForm(false);
    } catch (error) {
      console.error("Error creating feature:", error);
      toast.error("Không thể thêm tính năng");
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    if (!confirm("Bạn có chắc muốn xóa tính năng này?")) {
      return;
    }

    try {
      await vehicleService.deleteFeature(featureId);
      toast.success("Xóa tính năng thành công");

      // Remove from features list
      setFeatures(features.filter((f) => f.id !== featureId));

      // Remove from selected features
      setFormData({
        ...formData,
        featureIds: formData.featureIds.filter((id) => id !== featureId),
      });
    } catch (error) {
      console.error("Error deleting feature:", error);
      toast.error("Không thể xóa tính năng");
    }
  };

  const handleAddImage = () => {
    const url = prompt("Nhập URL hình ảnh:");
    if (url && url.trim()) {
      setImageUrls([...imageUrls, url.trim()]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/vehicles")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">
            {isNew ? "Thêm Phương Tiện Mới" : "Chỉnh Sửa Phương Tiện"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Cơ Bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại Phương Tiện *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "CAR" | "MOTORCYCLE") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">Ô tô</SelectItem>
                    <SelectItem value="MOTORCYCLE">Xe máy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tên Phương Tiện *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Toyota Vios 2023"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandId">Hãng *</Label>
                <Select
                  value={formData.brandId}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, brandId: value, modelId: "" })
                  }
                  disabled={loadingBrands}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={loadingBrands ? "Đang tải..." : "Chọn hãng"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelId">Mẫu *</Label>
                <Select
                  value={formData.modelId}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, modelId: value })
                  }
                  disabled={!formData.brandId || loadingModels}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !formData.brandId
                          ? "Chọn hãng trước"
                          : loadingModels
                          ? "Đang tải..."
                          : "Chọn mẫu"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">Biển Số *</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) =>
                    setFormData({ ...formData, licensePlate: e.target.value })
                  }
                  placeholder="51A-12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">Số Chỗ Ngồi *</Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.seats}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seats: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType">Loại Nhiên Liệu *</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(value: VehicleFormData["fuelType"]) =>
                    setFormData({ ...formData, fuelType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GASOLINE">Xăng</SelectItem>
                    <SelectItem value="DIESEL">Dầu Diesel</SelectItem>
                    <SelectItem value="ELECTRIC">Điện</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission">Hộp Số *</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value: "AUTOMATIC" | "MANUAL") =>
                    setFormData({ ...formData, transmission: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTOMATIC">Tự động</SelectItem>
                    <SelectItem value="MANUAL">Số sàn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Giá Thuê</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerHour">Giá/Giờ (VNĐ) *</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerHour: parseInt(e.target.value),
                    })
                  }
                  placeholder="50000"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Giá/Ngày (VNĐ) *</Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerDay: parseInt(e.target.value),
                    })
                  }
                  placeholder="800000"
                  min="0"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Vị Trí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Địa Chỉ *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="123 Nguyễn Văn A, Quận 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Thành Phố *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="TP.HCM"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Phường/Xã *</Label>
                <Input
                  id="ward"
                  value={formData.ward}
                  onChange={(e) =>
                    setFormData({ ...formData, ward: e.target.value })
                  }
                  placeholder="Phường Bến Nghé"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Vĩ Độ</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: parseFloat(e.target.value),
                    })
                  }
                  placeholder="10.7769"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Kinh Độ</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: parseFloat(e.target.value),
                    })
                  }
                  placeholder="106.7009"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Mô Tả</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Mô Tả Chi Tiết</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Xe mới, sạch sẽ, tiết kiệm nhiên liệu"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tiện Nghi</CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowFeatureForm(!showFeatureForm)}
                className="bg-[#007BFF] hover:bg-[#0056b3]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm Tính Năng
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Feature Form */}
            {showFeatureForm && (
              <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="featureName">Tên Tính Năng *</Label>
                  <Input
                    id="featureName"
                    value={newFeature.name}
                    onChange={(e) =>
                      setNewFeature({ ...newFeature, name: e.target.value })
                    }
                    placeholder="Bluetooth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featureDescription">Mô Tả *</Label>
                  <Input
                    id="featureDescription"
                    value={newFeature.description}
                    onChange={(e) =>
                      setNewFeature({
                        ...newFeature,
                        description: e.target.value,
                      })
                    }
                    placeholder="Kết nối Bluetooth không dây"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featureIcon">Icon *</Label>
                  <Input
                    id="featureIcon"
                    value={newFeature.icon}
                    onChange={(e) =>
                      setNewFeature({ ...newFeature, icon: e.target.value })
                    }
                    placeholder="bluetooth"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateFeature}
                    className="bg-[#28a745] hover:bg-[#218838]"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Lưu
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowFeatureForm(false);
                      setNewFeature({ name: "", description: "", icon: "" });
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Hủy
                  </Button>
                </div>
              </div>
            )}

            {/* Features List */}
            {loadingFeatures ? (
              <p className="text-muted-foreground">Đang tải tính năng...</p>
            ) : features.length === 0 ? (
              <p className="text-muted-foreground">Không có tính năng nào</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <Checkbox
                        id={feature.id}
                        checked={formData.featureIds.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={feature.id}
                          className="cursor-pointer font-medium"
                        >
                          {feature.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteFeature(feature.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Điều Khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                placeholder="Nhập điều khoản..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTerm())
                }
              />
              <Button type="button" onClick={handleAddTerm}>
                Thêm
              </Button>
            </div>

            {formData.terms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.terms.map((term, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full"
                  >
                    <span>{term}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTerm(term)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Hình Ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button type="button" onClick={handleAddImage} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Thêm URL Hình Ảnh
            </Button>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Vehicle ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/150";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng Thái</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.status}
              onValueChange={(value: "ACTIVE" | "INACTIVE") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/vehicles")}
          >
            Hủy
          </Button>
          <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056b3]">
            <Save className="h-4 w-4 mr-2" />
            {isNew ? "Tạo Phương Tiện" : "Cập Nhật"}
          </Button>
        </div>
      </form>
    </div>
  );
}
