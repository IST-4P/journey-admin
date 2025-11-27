import { Editor } from "@tinymce/tinymce-react";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import * as blogService from "../../lib/services/blog.service";
import * as mediaService from "../../lib/services/media.service";
import type {
  CreateBlogRequest,
  UpdateBlogRequest,
} from "../../lib/types/blog.types";

const REGIONS = [
  "TP.HCM",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Nha Trang",
];

interface PostFormData {
  title: string;
  content: string;
  type: string;
  region: string;
  thumbnail: string;
  tag: string;
}

const initialFormData: PostFormData = {
  title: "",
  content: "",
  type: "",
  region: "",
  thumbnail: "",
  tag: "",
};

export function PostFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [formData, setFormData] = useState<PostFormData>(initialFormData);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load blog data when editing
  useEffect(() => {
    const loadBlog = async () => {
      if (!isNew && id) {
        try {
          setIsLoading(true);
          const blog = await blogService.getBlog(id);
          setFormData({
            title: blog.title,
            content: blog.content || "",
            type: blog.type,
            region: blog.region,
            thumbnail: blog.thumbnail,
            tag: blog.tag || "",
          });
        } catch (error) {
          console.error("Error loading blog:", error);
          toast.error("Không thể tải thông tin bài viết");
          navigate("/posts");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadBlog();
  }, [id, isNew, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }
    if (!formData.type.trim()) {
      toast.error("Vui lòng nhập loại bài viết");
      return;
    }
    if (!formData.region.trim()) {
      toast.error("Vui lòng chọn khu vực");
      return;
    }
    if (!formData.thumbnail.trim()) {
      toast.error("Vui lòng upload hình ảnh đại diện");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isNew) {
        // Create new blog
        const createData: CreateBlogRequest = {
          title: formData.title,
          content: formData.content,
          type: formData.type,
          region: formData.region,
          thumbnail: formData.thumbnail,
          tag: formData.tag || undefined,
        };
        await blogService.createBlog(createData);
        toast.success("Tạo bài viết thành công");
      } else {
        // Update existing blog
        const updateData: UpdateBlogRequest = {
          title: formData.title,
          content: formData.content,
          type: formData.type,
          region: formData.region,
          thumbnail: formData.thumbnail,
          tag: formData.tag || undefined,
        };
        await blogService.updateBlog(id!, updateData);
        toast.success("Cập nhật bài viết thành công");
      }
      navigate("/posts");
    } catch (error: any) {
      console.error("Error saving blog:", error);
      toast.error(error.message || "Không thể lưu bài viết");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);

    try {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("File không phải là ảnh");
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File vượt quá 5MB");
      }

      // Upload and get URL
      const url = await mediaService.uploadImage(file);
      setFormData({ ...formData, thumbnail: url });
      toast.success("Đã upload ảnh thành công");

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Không thể upload ảnh");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddFeaturedImage = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/posts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">
            {isNew ? "Thêm Bài Viết Mới" : "Chỉnh Sửa Bài Viết"}
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
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu Đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nhập tiêu đề bài viết"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại Bài Viết *</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  placeholder="Ví dụ: ABC, DEF"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Khu Vực *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, region: value })
                  }
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) =>
                  setFormData({ ...formData, tag: e.target.value })
                }
                placeholder="Ví dụ: ABC, XYZ"
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Nội Dung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Nội Dung Chi Tiết *</Label>
              <Editor
                apiKey={import.meta.env.VITE_TINY_API_KEY}
                value={formData.content}
                onEditorChange={(content) =>
                  setFormData({ ...formData, content })
                }
                disabled={isSubmitting}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic forecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "image link | removeformat | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  language: "vi",
                  // Image upload handler
                  images_upload_handler: async (blobInfo: any) => {
                    try {
                      const file = blobInfo.blob();

                      // Validate file type
                      if (!file.type.startsWith("image/")) {
                        throw new Error("File không phải là ảnh");
                      }

                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        throw new Error("File vượt quá 5MB");
                      }

                      // Upload and get URL
                      const url = await mediaService.uploadImage(file as File);
                      return url;
                    } catch (error: any) {
                      console.error("Error uploading image:", error);
                      toast.error(error.message || "Không thể upload ảnh");
                      throw error;
                    }
                  },
                  // Allow both file upload and URL input
                  image_title: true,
                  automatic_uploads: true,
                  file_picker_types: "image",
                  file_picker_callback: (
                    callback: any,
                    _value: any,
                    meta: any
                  ) => {
                    if (meta.filetype === "image") {
                      const input = document.createElement("input");
                      input.setAttribute("type", "file");
                      input.setAttribute("accept", "image/*");

                      input.onchange = async function () {
                        const file = (input as HTMLInputElement).files?.[0];
                        if (!file) return;

                        try {
                          // Validate file type
                          if (!file.type.startsWith("image/")) {
                            throw new Error("File không phải là ảnh");
                          }

                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            throw new Error("File vượt quá 5MB");
                          }

                          // Upload and get URL
                          const url = await mediaService.uploadImage(file);
                          callback(url, { alt: file.name });
                          toast.success("Đã upload ảnh thành công");
                        } catch (error: any) {
                          console.error("Error uploading image:", error);
                          toast.error(error.message || "Không thể upload ảnh");
                        }
                      };

                      input.click();
                    }
                  },
                }}
              />
              <p className="text-xs text-gray-500">
                Bạn có thể upload ảnh từ máy tính hoặc nhập URL ảnh trực tiếp
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <CardTitle>Hình Ảnh Đại Diện *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              type="button"
              onClick={handleAddFeaturedImage}
              variant="outline"
              disabled={isUploadingImage || isSubmitting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploadingImage
                ? "Đang Upload..."
                : formData.thumbnail
                ? "Thay Đổi Hình Ảnh"
                : "Thêm Hình Ảnh"}
            </Button>

            {formData.thumbnail && (
              <div className="relative inline-block">
                <img
                  src={formData.thumbnail}
                  alt="Featured"
                  className="w-full max-w-md h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x200";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, thumbnail: "" })}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/posts")}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="bg-[#007BFF] hover:bg-[#0056b3]"
            disabled={isSubmitting || isUploadingImage}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting
              ? "Đang xử lý..."
              : isNew
              ? "Tạo Bài Viết"
              : "Cập Nhật"}
          </Button>
        </div>
      </form>
    </div>
  );
}
